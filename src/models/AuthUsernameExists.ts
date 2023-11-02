import { AxiosRequest } from '../hooks/useAxios';

export interface UsernameExistsRequest {
  username: string;
}

export interface UsernameExists {
  username: string;
  exists: boolean;
}

export const postUsernameExists = (data: UsernameExistsRequest) =>
  ({
    url: '/auth/username-exists/',
    method: 'post',
    data,
  }) as AxiosRequest<UsernameExistsRequest>;
