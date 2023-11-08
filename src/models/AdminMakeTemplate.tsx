import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface AdminMakeTemplateRequest {
  is_template: boolean;
}

export interface AdminMakeTemplate {
  is_template: boolean;
}

export const patchAdminMakeTemplate = (
  id: number,
  data: AdminMakeTemplateRequest,
) =>
  ({
    method: 'patch',
    url: `/conductor/admin/make-template/${id}/`,
    data,
  }) as ComposerAxiosRequest<AdminMakeTemplateRequest>;
