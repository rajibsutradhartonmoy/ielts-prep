import { Injectable, UnauthorizedException, BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '@/database/database.module';
import * as schema from '@/database/schema';
import {
  LoginDto,
  RegisterUserDto,
  RefreshTokenDto,
  RegisterOrganizationDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto
} from './dto/auth.dto';
import { NotificationService } from '../notification/notification.service';

export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: Database,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  async validateUser(email: string, password: string, organizationId: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.email, email),
          eq(schema.users.organizationId, organizationId),
          eq(schema.users.isActive, true),
        ),
      )
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.organizationId,
    );

    // Update last login
    await this.db
      .update(schema.users)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.users.id, user.id));

    return this.generateTokens(user);
  }

  async registerUser(registerDto: RegisterUserDto) {
    // Check if email already exists in organization
    const [existingUser] = await this.db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.email, registerDto.email),
          eq(schema.users.organizationId, registerDto.organizationId),
        ),
      )
      .limit(1);

    if (existingUser) {
      throw new BadRequestException('Email already registered in this organization');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        organizationId: registerDto.organizationId,
        email: registerDto.email,
        passwordHash,
        name: registerDto.name,
        role: registerDto.role,
      })
      .returning();

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      organizationId: newUser.organizationId,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const [user] = await this.db
        .select()
        .from(schema.users)
        .where(
          and(
            eq(schema.users.id, payload.sub),
            eq(schema.users.isActive, true),
          ),
        )
        .limit(1);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async registerOrganization(registerDto: RegisterOrganizationDto) {
    // Generate slug from organization name
    const slug = registerDto.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if organization name or slug already exists
    const [existingOrg] = await this.db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, slug))
      .limit(1);

    if (existingOrg) {
      throw new BadRequestException('Organization name already exists');
    }

    // Check if email is already used
    const [existingUser] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, registerDto.email))
      .limit(1);

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create organization
    const [newOrg] = await this.db
      .insert(schema.organizations)
      .values({
        name: registerDto.organizationName,
        slug,
        email: registerDto.email,
        phone: registerDto.phone,
        isActive: true,
        subscriptionTier: 'free',
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      })
      .returning();

    // Create admin user
    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        organizationId: newOrg.id,
        email: registerDto.email,
        passwordHash,
        name: registerDto.fullName,
        role: 'organization_admin',
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      })
      .returning();

    // Send verification email
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    await this.notificationService.sendEmailVerification(
      newUser.email,
      newUser.name,
      registerDto.organizationName,
      verificationUrl
    );

    return {
      message: 'Organization registered successfully. Please check your email to verify your account.',
      organizationId: newOrg.id,
      userId: newUser.id,
      email: newUser.email,
    };
  }

  async verifyEmail(verifyDto: VerifyEmailDto) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.emailVerificationToken, verifyDto.token))
      .limit(1);

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email already verified');
    }

    // Update user
    await this.db
      .update(schema.users)
      .set({
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
        isActive: true,
      })
      .where(eq(schema.users.id, user.id));

    return {
      message: 'Email verified successfully',
      email: user.email,
    };
  }

  async resendVerificationEmail(resendDto: ResendVerificationDto) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.email, resendDto.email),
          eq(schema.users.organizationId, resendDto.organizationId)
        )
      )
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user
    await this.db
      .update(schema.users)
      .set({
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      })
      .where(eq(schema.users.id, user.id));

    // Get organization
    const [org] = await this.db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.id, user.organizationId))
      .limit(1);

    // Send verification email
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    await this.notificationService.sendEmailVerification(
      user.email,
      user.name,
      org?.name || 'IELTS Prep Platform',
      verificationUrl
    );

    return {
      message: 'Verification email sent successfully',
    };
  }

  async forgotPassword(forgotDto: ForgotPasswordDto) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.email, forgotDto.email),
          eq(schema.users.organizationId, forgotDto.organizationId),
          eq(schema.users.isActive, true)
        )
      )
      .limit(1);

    if (!user) {
      // Don't reveal if user exists for security
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user
    await this.db
      .update(schema.users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      })
      .where(eq(schema.users.id, user.id));

    // Send password reset email
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.notificationService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken,
      resetUrl
    );

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.passwordResetToken, resetDto.token))
      .limit(1);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(resetDto.newPassword, 12);

    // Update user
    await this.db
      .update(schema.users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(schema.users.id, user.id));

    return {
      message: 'Password reset successfully',
    };
  }

  async changePassword(userId: string, changeDto: ChangePasswordDto) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changeDto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(changeDto.newPassword, 12);

    // Update user
    await this.db
      .update(schema.users)
      .set({ passwordHash })
      .where(eq(schema.users.id, user.id));

    return {
      message: 'Password changed successfully',
    };
  }

  private generateTokens(user: typeof schema.users.$inferSelect): TokenResponse {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload);
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
