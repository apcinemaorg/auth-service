import { getAuthGrpcServerOptions } from '@apcinema/shared';
import { NestFactory } from '@nestjs/core';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: getAuthGrpcServerOptions('localhost:50051'),
    });

    await app.startAllMicroservices();
    await app.init();
}
bootstrap();
