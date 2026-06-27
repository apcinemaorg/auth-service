import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    
    public constructor(private readonly configService: ConfigService) {
        const adapter = new PrismaPg({ 
            user: configService.getOrThrow<string>('POSTGRES_USER'),
            password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
            host: configService.getOrThrow<string>('POSTGRES_HOST'),
            port: configService.getOrThrow<number>('POSTGRES_PORT'),
            database: configService.getOrThrow<string>('POSTGRES_DB')
         });

        super({ adapter });
    }

    public async onModuleInit() {
        const start = Date.now();

        this.logger.log('PrismaService initialized');
        try {
            await this.$connect();
            const ms = Date.now() - start;
            this.logger.log(`PrismaService initialized in ${ms}ms`);
        } catch (error) {
            this.logger.error('Error initializing PrismaService', error);
            throw error;
        }
    }

    public async onModuleDestroy() {
        const start = Date.now();
        this.logger.log('PrismaService destroyed');
        try {
            await this.$disconnect();
            const ms = Date.now() - start;
            this.logger.log(`PrismaService destroyed in ${ms}ms`);
        } catch (error) {
            this.logger.error('Error destroying PrismaService', error);
            throw error;
        }
    }
}
