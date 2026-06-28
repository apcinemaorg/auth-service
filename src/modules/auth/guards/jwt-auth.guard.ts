import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { AuthTokenPayload, isAuthTokenPayload } from '../types/auth-token.payload';

export type AuthenticatedRequest = Request & {
    user: AuthTokenPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
    public constructor(private readonly jwtService: JwtService) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const token = this.extractBearerToken(request);

        if (!token) {
            throw new UnauthorizedException('Missing access token');
        }

        try {
            const payload: unknown = await this.jwtService.verifyAsync(token);

            if (!isAuthTokenPayload(payload) || payload.type !== 'access') {
                throw new UnauthorizedException('Invalid access token');
            }

            request.user = payload;
            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException('Invalid access token');
        }
    }

    private extractBearerToken(request: Request): string | undefined {
        const authorization = request.headers.authorization;

        if (!authorization) {
            return undefined;
        }

        const [scheme, token] = authorization.split(' ');

        if (scheme !== 'Bearer' || !token) {
            return undefined;
        }

        return token;
    }
}
