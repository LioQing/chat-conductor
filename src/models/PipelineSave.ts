import { ComposerAxiosRequest } from '../hooks/useComposerAxios';
import { JsonObject } from '../utils/JsonObject';

export interface PipelineSaveComponentInstance {
  id: number;
  is_enabled: boolean;
  order: number;
  name: string;
  function_name: string;
  description: JsonObject;
  code: string;
  state: JsonObject;
}

export interface PipelineSaveRequest {
  name: string;
  components: PipelineSaveComponentInstance[];
}

export const patchPipelineSave = (id: number, data: PipelineSaveRequest) =>
  ({
    url: `/conductor/pipeline/save/${id}/`,
    method: 'patch',
    data,
  }) as ComposerAxiosRequest<PipelineSaveRequest>;
