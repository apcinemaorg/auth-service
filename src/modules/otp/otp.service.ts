import { RedisService } from '@/infrastructure/redis/redis.service';
import { SendOtpRequest, VerifyOtpRequest } from '@apcinema/contracts/gen/auth';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { createHash } from 'crypto';

@Injectable()
export class OtpService {

    public constructor(private readonly redisService: RedisService) {}
    public async sendOtp(data: SendOtpRequest): Promise<number> {
        const { identifier, type } = data;
        const code = this.generateCode();
        const hash = createHash('sha256').update(code.toString()).digest('hex');

        await this.redisService.set(`otp:${type}:${identifier}`, hash, 'EX', 300);
        return code;
    }
    private generateCode(): number {
        return Math.floor(100000 + Math.random() * 900000);
    }

    public async verifyOtp(data: VerifyOtpRequest): Promise<boolean> {
        const { identifier, type, code } = data;
        const storedHash = await this.redisService.get(`otp:${type}:${identifier}`);
        const newHash = createHash('sha256').update(code.toString()).digest('hex');
        if(!storedHash){
            throw new RpcException('Invalid OTP');
        }
        if(storedHash !== newHash){
            throw new RpcException('Invalid OTP');
        }
        await this.redisService.del(`otp:${type}:${identifier}`);
        return true;
    }
}
