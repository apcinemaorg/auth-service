import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
    AuthTokensResponseDto,
    LoginDto,
    LoginResponseDto,
    LogoutResponseDto,
    MeResponseDto,
    RefreshTokenDto,
    RegisterDto,
    RegisterResponseDto,
    SendOtpDto,
    SendOtpResponseDto,
    VerifyOtpDto,
    VerifyOtpResponseDto,
} from './dto/auth.dto';
import { JwtAuthGuard, type AuthenticatedRequest } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthHttpController {
    public constructor(private readonly authService: AuthService) {}

    @Post('send-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send OTP code to phone or email' })
    @ApiBody({ type: SendOtpDto })
    @ApiResponse({ status: 200, description: 'OTP sent', type: SendOtpResponseDto })
    public async sendOtp(@Body() body: SendOtpDto): Promise<SendOtpResponseDto> {
        return this.authService.sendOtp(body);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify OTP code for existing account' })
    @ApiBody({ type: VerifyOtpDto })
    @ApiResponse({ status: 200, description: 'OTP verified', type: VerifyOtpResponseDto })
    public async verifyOtp(@Body() body: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
        return this.authService.verifyOtp(body);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new account with password' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'Account created', type: RegisterResponseDto })
    @ApiResponse({ status: 200, description: 'Registration failed', type: RegisterResponseDto })
    public async register(@Body() body: RegisterDto): Promise<RegisterResponseDto> {
        return this.authService.registerAccount(body);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with password' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login result', type: LoginResponseDto })
    public async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
        return this.authService.login(body);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({ status: 200, description: 'New token pair', type: AuthTokensResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    public async refresh(@Body() body: RefreshTokenDto): Promise<AuthTokensResponseDto> {
        return this.authService.refresh(body.refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout and invalidate refresh token' })
    @ApiResponse({ status: 200, description: 'Logged out', type: LogoutResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    public async logout(@Req() request: AuthenticatedRequest): Promise<LogoutResponseDto> {
        return this.authService.logout(request.user.sub);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current authenticated user' })
    @ApiResponse({ status: 200, description: 'Current user', type: MeResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    public async me(@Req() request: AuthenticatedRequest): Promise<MeResponseDto> {
        return this.authService.getMe(request.user.sub);
    }
}
