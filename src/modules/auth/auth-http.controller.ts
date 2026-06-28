import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
    LoginDto,
    LoginResponseDto,
    RegisterDto,
    RegisterResponseDto,
    SendOtpDto,
    SendOtpResponseDto,
    VerifyOtpDto,
    VerifyOtpResponseDto,
} from './dto/auth.dto';

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
}
