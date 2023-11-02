import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface ComponentSearchParams {
  query: string;
  filter: 'created' | 'templates';
}

export interface ComponentSearch {
  id: number;
  name: string;
}

export const getComponentSearch = (params: ComponentSearchParams) =>
  ({
    url: '/conductor/component/search/',
    method: 'get',
    params,
  }) as ComposerAxiosRequest<{}, {}, ComponentSearchParams>;
