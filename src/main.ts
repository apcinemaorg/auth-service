import { getAuthGrpcServerOptions } from '@apcinema/shared';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Auth Service')
        .setDescription('Authentication API: OTP, registration and login')
        .setVersion('1.0')
        .addTag('Auth')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: getAuthGrpcServerOptions('localhost:50051'),
    });

    await app.startAllMicroservices();

    const httpPort = Number(process.env.HTTP_PORT ?? 3000);
    await app.listen(httpPort);
}

bootstrap();
