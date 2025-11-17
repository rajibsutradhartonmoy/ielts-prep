import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsEnum,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AddressDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  zip?: string;
}

export class CreateOrganizationDto {
  @ApiProperty({ example: 'ABC Language School' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin@abc-school.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({ enum: ['free', 'basic', 'premium', 'enterprise'] })
  @IsEnum(['free', 'basic', 'premium', 'enterprise'])
  @IsOptional()
  subscriptionTier?: 'free' | 'basic' | 'premium' | 'enterprise';

  // Admin user details
  @ApiProperty({ example: 'admin@abc-school.com' })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({ example: 'John Admin' })
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  adminPassword: string;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: ['free', 'basic', 'premium', 'enterprise'] })
  @IsEnum(['free', 'basic', 'premium', 'enterprise'])
  @IsOptional()
  subscriptionTier?: 'free' | 'basic' | 'premium' | 'enterprise';

  @ApiPropertyOptional({ enum: ['trial', 'active', 'suspended', 'cancelled'] })
  @IsEnum(['trial', 'active', 'suspended', 'cancelled'])
  @IsOptional()
  subscriptionStatus?: 'trial' | 'active' | 'suspended' | 'cancelled';
}
