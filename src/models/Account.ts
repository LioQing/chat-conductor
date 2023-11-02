import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface Account {
  id: number;
  username: string;
  name: string;
  email: string;
  is_whitelisted: boolean;
  date_joined: string;
}

export const getAccount = () =>
  ({
    url: `/conductor/account/`,
    method: 'get',
  }) as ComposerAxiosRequest<Account>;
