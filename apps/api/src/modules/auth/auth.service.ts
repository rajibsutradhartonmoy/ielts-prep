import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '@/database/database.module';
import * as schema from '@/database/schema';
import { LoginDto, RegisterUserDto, RefreshTokenDto } from './dto/auth.dto';

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
