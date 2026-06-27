import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GrpcMethod } from '@nestjs/microservices';
import type { SendOtpRequest, SendOtpResponse, VerifyOtpRequest, VerifyOtpResponse} from '@apcinema/contracts/gen/auth'


@Controller()
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'SendOtp')
  public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
    return await this.authService.sendOtp(data)
  }

  @GrpcMethod('AuthService', 'VerifyOtp')
  public async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return await this.authService.verifyOtp(data)
  }
}
