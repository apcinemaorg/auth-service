export type AuthTokenType = 'access' | 'refresh';

export interface AuthTokenPayload {
    sub: string;
    type: AuthTokenType;
}

export function isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    if (!('sub' in value) || typeof value.sub !== 'string') {
        return false;
    }

    if (!('type' in value)) {
        return false;
    }

    return value.type === 'access' || value.type === 'refresh';
}
