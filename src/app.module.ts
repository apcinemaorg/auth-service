import { Module } from '@nestjs/common'
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './infrastructure/redis/redis.module';
import { OtpModule } from './modules/otp/otp.module';

@Module({
	imports: [PrismaModule, RedisModule, AuthModule, ConfigModule.forRoot({
		isGlobal: true,
		envFilePath: '.env'
	}), RedisModule, OtpModule],
	controllers: [],
	providers: []
})
export class AppModule {}
