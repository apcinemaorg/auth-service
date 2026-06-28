import type { SendOtpRequest, VerifyOtpRequest, VerifyOtpResponse, RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from '@apcinema/contracts/gen/auth';
import { AuthGrpcErrors } from '@/shared/grpc/auth-grpc.errors';
import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/generated/client';
import * as bcrypt from 'bcrypt';

import { OtpService } from '../otp/otp.service';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
    public constructor(
        private readonly authRepository: AuthRepository,
        private readonly otpService: OtpService,
    ) {}

    public async sendOtp(data: SendOtpRequest) {
        const { identifier, type } = data;
        await this.otpService.sendOtp({ identifier, type });
        return { ok: true };
    }

    public async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
        const { identifier, type, code } = data;

        await this.otpService.verifyOtp({ identifier, type, code });
        const account = await this.resolveAccount(identifier, type);

        if (!account) {
            throw AuthGrpcErrors.accountNotFound();
        }

        if (type === 'phone' && !account.isPhoneVerified) {
            await this.authRepository.updateAccount(account.id, {
                isPhoneVerified: true,
            });
        }

        if (type === 'email' && !account.isEmailVerified) {
            await this.authRepository.updateAccount(account.id, {
                isEmailVerified: true,
            });
        }

        return { accessToken: 'access_token', refreshToken: 'refresh_token' };
    }

    private async resolveAccount(
        identifier: string,
        type: string,
    ): Promise<Account | null> {
        if (type === 'phone') {
            return this.authRepository.findAccountByPhone(identifier);
        }

        if (type === 'email') {
            return this.authRepository.findAccountByEmail(identifier);
        }

        return null;
    }

    public async registerAccount(data: RegisterRequest): Promise<RegisterResponse> {
        const { identifier, type, password, username, firstName, lastName } = data;
        const account = await this.resolveAccount(identifier, type);

        if (account) {
            return { ok: false, accessToken: '', refreshToken: '', errorMessage: 'Account already exists' };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await this.authRepository.createAccount({
            phone: type === 'phone' ? identifier : undefined,
            email: type === 'email' ? identifier : undefined,
            passwordHash,
            username,
            firstName,
            lastName,
        });

        return { ok: true, accessToken: '', refreshToken: '', errorMessage: '' };
    }

    public async login(data: LoginRequest): Promise<LoginResponse> {
        const { identifier, type, password } = data;
        const account = await this.resolveAccount(identifier, type);

        if (!account?.passwordHash) {
            return { ok: false, accessToken: '', refreshToken: '', errorMessage: 'Invalid credentials' };
        }

        const isPasswordValid = await bcrypt.compare(password, account.passwordHash);

        if (!isPasswordValid) {
            return { ok: false, accessToken: '', refreshToken: '', errorMessage: 'Invalid credentials' };
        }

        return { ok: true, accessToken: '', refreshToken: '', errorMessage: '' };
    }
}
