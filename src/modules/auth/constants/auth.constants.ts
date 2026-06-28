export const ACCESS_TOKEN_EXPIRES_IN = '15m';
export const REFRESH_TOKEN_EXPIRES_IN = '7d';
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export function getRefreshTokenRedisKey(accountId: string): string {
    return `refresh_token:${accountId}`;
}
