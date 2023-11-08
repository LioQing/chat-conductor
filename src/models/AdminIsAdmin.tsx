import { AxiosRequest } from '../hooks/useAxios';

export interface IsAdmin {
  is_admin: boolean;
}

export const getIsAdmin = () =>
  ({
    url: '/auth/is-admin/',
    method: 'get',
  }) as AxiosRequest<IsAdmin>;
