import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface AuthIsWhitelisted {
  is_whitelisted: boolean;
}

export const getIswhitelisted = () =>
  ({
    url: '/auth/is-whitelisted',
    method: 'get',
  }) as ComposerAxiosRequest<AuthIsWhitelisted>;
