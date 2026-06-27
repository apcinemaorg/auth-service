import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);

    public constructor(private readonly configService: ConfigService) {
        super({
            host: configService.getOrThrow<string>('REDIS_HOST'),
            port: configService.getOrThrow<number>('REDIS_PORT'),
            username: configService.getOrThrow<string>('REDIS_USER'),
            password: configService.getOrThrow<string>('REDIS_PASSWORD'),
            maxRetriesPerRequest: 5,
            enableOfflineQueue: true
        });
    }

    public async onModuleInit() {
        const start = Date.now();
        this.logger.log('RedisService initialized');
        this.on('connect', () => {
            const ms = Date.now() - start;
            this.logger.log(`RedisService connected in ${ms}ms`);
        });
        this.on('error', (error) => {
            this.logger.error('Error connecting to Redis', error);
            throw error;
        });
        this.on('ready', () => {
            const ms = Date.now() - start;
            this.logger.log(`RedisService ready in ${ms}ms`);
        });
        this.on('reconnecting', () => {
            this.logger.log('RedisService reconnecting');
        });
        this.on('end', () => {
            this.logger.log('RedisService disconnected');
        });
        this.on('close', () => {
            this.logger.log('RedisService closed');
        });
    }

    public async onModuleDestroy() {
        const start = Date.now();
        this.logger.log('RedisService destroyed');
        try {
            await this.quit();
            const ms = Date.now() - start;
            this.logger.log(`RedisService destroyed in ${ms}ms`);
        } catch (error) {
            this.logger.error('Error destroying RedisService', error);
            throw error;
        }
    }
}
