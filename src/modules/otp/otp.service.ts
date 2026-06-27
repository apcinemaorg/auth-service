import { RedisService } from '@/infrastructure/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class OtpService {

    public constructor(private readonly redisService: RedisService) {}
    private generateCode(): string {
        const code = Math.floor(100000 + Math.random() * 900000);
        const hash = createHash('sha256').update(code.toString()).digest('hex');
        return hash;
    }
}
