import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface AdminTokenUsageUser {
  oai: number;
  vai: number;
}

export interface AdminTokenUsage {
  username: string;
  usage: AdminTokenUsageUser;
}

export const getAdminTokenUsage = () =>
  ({
    method: 'get',
    url: `/conductor/admin/token-usage/`,
  }) as ComposerAxiosRequest<AdminTokenUsage[]>;
