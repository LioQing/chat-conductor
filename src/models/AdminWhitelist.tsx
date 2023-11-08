import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface AdminWhitelistRequest {
  username: string;
  whitelist: boolean;
}

export interface AdminWhitelist {
  username: string;
  whitelist: boolean;
}

export const patchAdminWhitelist = (data: AdminWhitelistRequest) =>
  ({
    method: 'patch',
    url: '/conductor/admin/whitelist/',
    data,
  }) as ComposerAxiosRequest<AdminWhitelistRequest>;
