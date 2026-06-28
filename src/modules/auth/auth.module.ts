import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthHttpController } from './auth-http.controller';
import { AuthRepository } from './auth.repository';
import { OtpService } from '../otp/otp.service';

@Module({
  controllers: [AuthController, AuthHttpController],
  providers: [AuthService, AuthRepository, OtpService],
})
export class AuthModule {}
