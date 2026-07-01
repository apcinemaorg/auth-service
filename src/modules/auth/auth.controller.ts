import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
    GetMeRequest,
    GetMeResponse,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    RefreshRequest,
    RefreshResponse,
    RegisterRequest,
    RegisterResponse,
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from '@apcinema/contracts/gen/auth';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
    public constructor(private readonly authService: AuthService) {}

    @GrpcMethod('AuthService', 'SendOtp')
    public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
        return this.authService.sendOtp(data);
    }

    @GrpcMethod('AuthService', 'VerifyOtp')
    public async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
        return this.authService.verifyOtp(data);
    }

    @GrpcMethod('AuthService', 'Register')
    public async register(data: RegisterRequest): Promise<RegisterResponse> {
        return this.authService.registerAccount(data);
    }

    @GrpcMethod('AuthService', 'Login')
    public async login(data: LoginRequest): Promise<LoginResponse> {
        return this.authService.login(data);
    }

    @GrpcMethod('AuthService', 'Refresh')
    public async refresh(data: RefreshRequest): Promise<RefreshResponse> {
        const tokens = await this.authService.refresh(data.refreshToken);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    @GrpcMethod('AuthService', 'Logout')
    public async logout(data: LogoutRequest): Promise<LogoutResponse> {
        return this.authService.logout(data.accountId);
    }

    @GrpcMethod('AuthService', 'GetMe')
    public async getMe(data: GetMeRequest): Promise<GetMeResponse> {
        const me = await this.authService.getMe(data.accountId);

        return {
            id: me.id,
            phone: me.phone ?? undefined,
            email: me.email ?? undefined,
            username: me.username ?? undefined,
            firstName: me.firstName ?? undefined,
            lastName: me.lastName ?? undefined,
            isPhoneVerified: me.isPhoneVerified,
            isEmailVerified: me.isEmailVerified,
        };
    }
}
