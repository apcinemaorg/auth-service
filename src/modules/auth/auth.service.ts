import type { SendOtpRequest, VerifyOtpRequest, VerifyOtpResponse } from '@apcinema/contracts/gen/auth';
import { AuthGrpcErrors } from '@/shared/grpc/auth-grpc.errors';
import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/generated/client';

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
        let account = await this.resolveAccount(identifier, type);

        if (!account) {
            account = await this.authRepository.createAccount({
                phone: type === 'phone' ? identifier : undefined,
                email: type === 'email' ? identifier : undefined,
            });
        }

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
}
