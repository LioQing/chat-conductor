import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface Pipeline {
  id: number;
  name: string;
  created_at: string;
}

export const getPipelines = () =>
  ({
    url: '/conductor/pipelines/',
    method: 'get',
  }) as ComposerAxiosRequest;

export const postPipelineNew = () =>
  ({
    url: '/conductor/pipeline/new/',
    method: 'post',
    otherConfigs: {
      timeout: 20_000, // 20s
    },
  }) as ComposerAxiosRequest;

export const deletePipelineDelete = (id: number) =>
  ({
    url: `/conductor/pipeline/delete/${id}/`,
    method: 'delete',
  }) as ComposerAxiosRequest;
