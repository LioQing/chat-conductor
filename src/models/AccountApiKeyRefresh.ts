import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface AccountApiKeyRefreshRequest {
  password: string;
}

export interface AccountApiKeyRefresh {
  api_key: string;
}

export const postAccountApiKeyRefresh = (data: AccountApiKeyRefreshRequest) =>
  ({
    url: `/conductor/account/api-key/refresh/`,
    method: 'post',
    data,
  }) as ComposerAxiosRequest<AccountApiKeyRefreshRequest>;
