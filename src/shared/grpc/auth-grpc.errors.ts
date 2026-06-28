import { RpcStatus, serializeRpcErrorPayload } from '@apcinema/shared';
import { RpcException } from '@nestjs/microservices';

type AuthErrorCode = 'OTP_EXPIRED' | 'OTP_INVALID' | 'ACCOUNT_NOT_FOUND';

function authRpcException(
    grpcCode: number,
    errorCode: AuthErrorCode,
    message: string,
): RpcException {
    return new RpcException({
        code: grpcCode,
        message: serializeRpcErrorPayload(errorCode, message),
    });
}

export const AuthGrpcErrors = {
    otpExpired: () =>
        authRpcException(
            RpcStatus.NOT_FOUND,
            'OTP_EXPIRED',
            'OTP has expired or was not requested. Request a new code.',
        ),
    otpInvalid: () =>
        authRpcException(
            RpcStatus.INVALID_ARGUMENT,
            'OTP_INVALID',
            'Invalid OTP code. Check the code and try again.',
        ),
    accountNotFound: () =>
        authRpcException(
            RpcStatus.NOT_FOUND,
            'ACCOUNT_NOT_FOUND',
            'Account not found for the provided identifier.',
        ),
};
