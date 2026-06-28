import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    SendOtpRequest,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from '@apcinema/contracts/gen/auth';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { AuthGrpcErrors } from '@/shared/grpc/auth-grpc.errors';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Account } from '@prisma/generated/client';
import * as bcrypt from 'bcrypt';

import { OtpService } from '../otp/otp.service';
import {
    ACCESS_TOKEN_EXPIRES_IN,
    getRefreshTokenRedisKey,
    REFRESH_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_TTL_SECONDS,
} from './constants/auth.constants';
import { AuthRepository } from './auth.repository';
import { AuthTokenPayload, isAuthTokenPayload } from './types/auth-token.payload';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface MeResponse {
    id: string;
    phone: string | null;
    email: string | null;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
}

@Injectable()
export class AuthService {
    public constructor(
        private readonly authRepository: AuthRepository,
        private readonly otpService: OtpService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) {}

    private async issueTokens(account: Account): Promise<AuthTokens> {
        const accessToken = await this.jwtService.signAsync(
            { sub: account.id, type: 'access' satisfies AuthTokenPayload['type'] },
            { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
        );
        const refreshToken = await this.jwtService.signAsync(
            { sub: account.id, type: 'refresh' satisfies AuthTokenPayload['type'] },
            { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
        );

        await this.redisService.set(
            getRefreshTokenRedisKey(account.id),
            refreshToken,
            'EX',
            REFRESH_TOKEN_TTL_SECONDS,
        );

        return { accessToken, refreshToken };
    }

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

        return this.issueTokens(account);
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
        const existingAccount = await this.resolveAccount(identifier, type);

        if (existingAccount) {
            return {
                ok: false,
                accessToken: '',
                refreshToken: '',
                errorMessage: 'Account already exists',
            };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const account = await this.authRepository.createAccount({
            phone: type === 'phone' ? identifier : undefined,
            email: type === 'email' ? identifier : undefined,
            passwordHash,
            username,
            firstName,
            lastName,
        });

        const { accessToken, refreshToken } = await this.issueTokens(account);

        return { ok: true, accessToken, refreshToken, errorMessage: '' };
    }

    public async login(data: LoginRequest): Promise<LoginResponse> {
        const { identifier, type, password } = data;
        const account = await this.resolveAccount(identifier, type);

        if (!account?.passwordHash) {
            return {
                ok: false,
                accessToken: '',
                refreshToken: '',
                errorMessage: 'Invalid credentials',
            };
        }

        const isPasswordValid = await bcrypt.compare(password, account.passwordHash);

        if (!isPasswordValid) {
            return {
                ok: false,
                accessToken: '',
                refreshToken: '',
                errorMessage: 'Invalid credentials',
            };
        }

        const { accessToken, refreshToken } = await this.issueTokens(account);

        return { ok: true, accessToken, refreshToken, errorMessage: '' };
    }

    public async refresh(refreshToken: string): Promise<AuthTokens> {
        let payload: unknown;

        try {
            payload = await this.jwtService.verifyAsync(refreshToken);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (!isAuthTokenPayload(payload) || payload.type !== 'refresh') {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const storedRefreshToken = await this.redisService.get(
            getRefreshTokenRedisKey(payload.sub),
        );

        if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const account = await this.authRepository.findAccountById(payload.sub);

        if (!account) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return this.issueTokens(account);
    }

    public async logout(accountId: string): Promise<{ ok: boolean }> {
        await this.redisService.del(getRefreshTokenRedisKey(accountId));
        return { ok: true };
    }

    public async getMe(accountId: string): Promise<MeResponse> {
        const account = await this.authRepository.findAccountById(accountId);

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        return {
            id: account.id,
            phone: account.phone,
            email: account.email,
            username: account.username,
            firstName: account.firstName,
            lastName: account.lastName,
            isPhoneVerified: account.isPhoneVerified,
            isEmailVerified: account.isEmailVerified,
        };
    }
}
