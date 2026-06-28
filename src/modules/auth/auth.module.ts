import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { OtpService } from '../otp/otp.service';
import { AuthController } from './auth.controller';
import { AuthHttpController } from './auth-http.controller';
import { ACCESS_TOKEN_EXPIRES_IN } from './constants/auth.constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Module({
    imports: [
        JwtModule.registerAsync({
            global: true,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
            }),
        }),
    ],
    controllers: [AuthController, AuthHttpController],
    providers: [AuthService, AuthRepository, OtpService, JwtAuthGuard],
})
export class AuthModule {}
