import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface AdminMakeSafe {
  is_safe: boolean;
}

export interface AdminMakeSafeRequest {
  is_safe: boolean;
}

export const patchAdminMakeSafe = (id: number, data: AdminMakeSafeRequest) =>
  ({
    method: 'patch',
    url: `/conductor/admin/make-safe/${id}/`,
    data,
  }) as ComposerAxiosRequest<AdminMakeSafeRequest>;
