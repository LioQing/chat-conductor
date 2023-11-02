import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface PipelineRenameRequest {
  name: string;
}

export interface PipelineRename {
  id: number;
  name: string;
}

export const putPipelineRename = (id: number, data: PipelineRenameRequest) =>
  ({
    url: `/conductor/pipeline/rename/${id}/`,
    method: 'patch',
    data,
  }) as ComposerAxiosRequest<PipelineRenameRequest>;
