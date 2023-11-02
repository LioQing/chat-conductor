import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface AccountPasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export const patchAccountPasswordChange = (
  data: AccountPasswordChangeRequest,
) =>
  ({
    url: `/conductor/account/password-change/`,
    method: 'patch',
    data,
  }) as ComposerAxiosRequest<AccountPasswordChangeRequest>;
