import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length, MinLength } from 'class-validator';

const IDENTIFIER_TYPES = ['phone', 'email'] as const;

export class IdentifierTypeDto {
    @ApiProperty({
        description: 'Phone number in E.164 format or email address',
        example: '+421950353687',
        default: '+421950353687',
    })
    @IsString()
    identifier: string;

    @ApiProperty({
        description: 'Type of identifier',
        enum: IDENTIFIER_TYPES,
        example: 'phone',
        default: 'phone',
    })
    @IsIn(IDENTIFIER_TYPES)
    type: string;
}

export class SendOtpDto extends IdentifierTypeDto {}

export class SendOtpResponseDto {
    @ApiProperty({ description: 'Whether OTP was sent successfully', example: true, default: true })
    ok: boolean;
}

export class VerifyOtpDto extends IdentifierTypeDto {
    @ApiProperty({
        description: '6-digit OTP code from SMS or email',
        example: '123456',
        default: '123456',
        minLength: 6,
        maxLength: 6,
    })
    @IsString()
    @Length(6, 6)
    code: string;
}

export class VerifyOtpResponseDto {
    @ApiProperty({ description: 'JWT access token', example: '' })
    accessToken: string;

    @ApiProperty({ description: 'JWT refresh token', example: '' })
    refreshToken: string;
}

export class RegisterDto extends IdentifierTypeDto {
    @ApiProperty({
        description: 'Account password',
        example: 'PasswordTest321!',
        default: 'PasswordTest321!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiPropertyOptional({
        description: 'Unique username',
        example: 'apervashov',
        default: 'apervashov',
    })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({
        description: 'User first name',
        example: 'Andrii',
        default: 'Andrii',
    })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional({
        description: 'User last name',
        example: 'Pervashov',
        default: 'Pervashov',
    })
    @IsOptional()
    @IsString()
    lastName?: string;
}

export class RegisterResponseDto {
    @ApiProperty({ description: 'Whether registration succeeded', example: true, default: true })
    ok: boolean;

    @ApiProperty({ description: 'JWT access token', example: '' })
    accessToken: string;

    @ApiProperty({ description: 'JWT refresh token', example: '' })
    refreshToken: string;

    @ApiProperty({ description: 'Error message when ok is false', example: '', default: '' })
    errorMessage: string;
}

export class LoginDto extends IdentifierTypeDto {
    @ApiProperty({
        description: 'Account password',
        example: 'PasswordTest321!',
        default: 'PasswordTest321!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string;
}

export class LoginResponseDto {
    @ApiProperty({ description: 'Whether login succeeded', example: true, default: true })
    ok: boolean;

    @ApiProperty({ description: 'JWT access token', example: '' })
    accessToken: string;

    @ApiProperty({ description: 'JWT refresh token', example: '' })
    refreshToken: string;

    @ApiProperty({ description: 'Error message when ok is false', example: '', default: '' })
    errorMessage: string;
}

export class RefreshTokenDto {
    @ApiProperty({
        description: 'Refresh token received during login or registration',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    refreshToken: string;
}

export class AuthTokensResponseDto {
    @ApiProperty({ description: 'JWT access token', example: '' })
    accessToken: string;

    @ApiProperty({ description: 'JWT refresh token', example: '' })
    refreshToken: string;
}

export class LogoutResponseDto {
    @ApiProperty({ description: 'Whether logout succeeded', example: true, default: true })
    ok: boolean;
}

export class MeResponseDto {
    @ApiProperty({ description: 'Account id', example: 'abc123' })
    id: string;

    @ApiPropertyOptional({ description: 'Phone number', example: '+421950353687', nullable: true })
    phone: string | null;

    @ApiPropertyOptional({ description: 'Email address', example: 'user@example.com', nullable: true })
    email: string | null;

    @ApiPropertyOptional({ description: 'Username', example: 'apervashov', nullable: true })
    username: string | null;

    @ApiPropertyOptional({ description: 'First name', example: 'Andrii', nullable: true })
    firstName: string | null;

    @ApiPropertyOptional({ description: 'Last name', example: 'Pervashov', nullable: true })
    lastName: string | null;

    @ApiProperty({ description: 'Whether phone is verified', example: true })
    isPhoneVerified: boolean;

    @ApiProperty({ description: 'Whether email is verified', example: false })
    isEmailVerified: boolean;
}
