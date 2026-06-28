jest.mock('@apcinema/shared', () => ({
    RpcStatus: {
        OK: 0,
        NOT_FOUND: 5,
        INVALID_ARGUMENT: 3,
    },
    serializeRpcErrorPayload: (code: string, message: string) =>
        JSON.stringify({ code, message }),
    parseRpcErrorPayload: (raw: string) => {
        try {
            return JSON.parse(raw);
        } catch {
            return { message: raw };
        }
    },
    grpcToHttp: {},
    getAuthGrpcServerOptions: jest.fn(),
    getAuthGrpcClientOptions: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';

import { AuthModule } from '../src/modules/auth/auth.module';
import { AuthRepository } from '../src/modules/auth/auth.repository';
import { OtpService } from '../src/modules/otp/otp.service';

describe('AuthModule (e2e)', () => {
    it('should compile', async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
        })
            .overrideProvider(AuthRepository)
            .useValue({})
            .overrideProvider(OtpService)
            .useValue({})
            .compile();

        expect(moduleFixture).toBeDefined();
        await moduleFixture.close();
    });
});
