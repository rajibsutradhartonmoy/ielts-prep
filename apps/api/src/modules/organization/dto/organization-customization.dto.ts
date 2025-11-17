import {
  IsString,
  IsOptional,
  IsHexColor,
  IsUrl,
  IsObject,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class UpdateBrandingDto {
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsUrl()
  emailHeaderLogoUrl?: string;

  @IsOptional()
  @IsString()
  emailFooterText?: string;
}

export class UpdateOrganizationSettingsDto {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  featuresEnabled?: string[];
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsObject()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
