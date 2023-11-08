import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface AdminCreateUserRequest {
  username: string;
  name: string;
  email: string;
}

export interface AdminCreateUser {
  id: number;
  username: string;
  name: string;
  email: string;
  password: string;
}

export const postAdminCreateUser = (data: AdminCreateUserRequest) =>
  ({
    method: 'post',
    url: '/conductor/admin/create-user/',
    data,
  }) as ComposerAxiosRequest<AdminCreateUserRequest>;
