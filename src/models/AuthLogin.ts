import { AxiosRequest } from '../hooks/useAxios';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Login {
  access: string;
  refresh: string;
  access_expiration: string;
  refresh_expiration: string;
}

export const postLogin = (data: LoginRequest) =>
  ({
    url: '/auth/login/',
    method: 'post',
    data,
  }) as AxiosRequest<LoginRequest>;
