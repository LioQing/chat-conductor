import { AxiosRequest } from '../hooks/useAxios';

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefresh {
  access: string;
}

export const postTokenRefresh = (data: TokenRefreshRequest) =>
  ({
    url: '/auth/token-refresh/',
    method: 'post',
    data,
  }) as AxiosRequest<TokenRefreshRequest>;
