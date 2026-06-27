import type { SendOtpRequest, VerifyOtpRequest, VerifyOtpResponse } from '@apcinema/contracts/gen/auth';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { Account } from '@prisma/generated/client';
import { OtpService } from '../otp/otp.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {

    public constructor(private readonly authRepository: AuthRepository, private readonly otpService: OtpService) { }
    public async sendOtp(data: SendOtpRequest) {
        const { identifier, type } = data;
        let account: Account | null = null
        if (type === 'phone') {
            account = await this.authRepository.findAccountByPhone(identifier)
        }
        if (type === 'email') {
            account = await this.authRepository.findAccountByEmail(identifier)
        }
        if (!account) {
            account = await this.authRepository.createAccount({
                phone: type === 'phone' ? identifier : undefined,
                email: type === 'email' ? identifier : undefined,
            })
        }
        const code = await this.otpService.sendOtp({ identifier, type });
        console.debug('CODE', code);
        return { ok: true };
    }
    public async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
        const { identifier, type, code } = data;

        await this.otpService.verifyOtp({ identifier, type, code });
        let account: Account | null = null
        if (type === 'phone') {
            account = await this.authRepository.findAccountByPhone(identifier)
        }
        if (type === 'email') {
            account = await this.authRepository.findAccountByEmail(identifier)
        }
        if (!account) {
            throw new RpcException('Account not found');
        }
        if (type === 'phone' && !account.isPhoneVerified) {
            await this.authRepository.updateAccount(account.id, { isPhoneVerified: true });
        }
        if (type === 'email' && !account.isEmailVerified) {
            await this.authRepository.updateAccount(account.id, { isEmailVerified: true });
        }
        return { accessToken: 'access_token', refreshToken: 'refresh_token' };
    }
}
