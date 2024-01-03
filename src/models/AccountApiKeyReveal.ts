import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface AccountApiKeyRevealRequest {
  password: string;
}

export interface AccountApiKeyReveal {
  api_key: string;
}

export const postAccountApiKeyReveal = (data: AccountApiKeyRevealRequest) =>
  ({
    url: `/conductor/account/api-key/reveal/`,
    method: 'post',
    data,
  }) as ComposerAxiosRequest<AccountApiKeyRevealRequest>;
