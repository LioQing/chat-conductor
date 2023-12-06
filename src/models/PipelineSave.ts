import { ComposerAxiosRequest } from '../hooks/useComposerAxios';
import { JsonObject } from '../utils/JsonObject';

export interface PipelineSaveComponentInstance {
  id: number;
  is_enabled: boolean;
  order: number;
  function_name: string;
  name: string;
  arguments: JsonObject;
  return_type: string;
  description: string;
  code: string;
  state: JsonObject;
}

export interface PipelineSaveRequest {
  name: string;
  state: JsonObject;
  description: string;
  components: PipelineSaveComponentInstance[];
}

export const patchPipelineSave = (id: number, data: PipelineSaveRequest) =>
  ({
    url: `/conductor/pipeline/save/${id}/`,
    method: 'patch',
    data,
  }) as ComposerAxiosRequest<PipelineSaveRequest>;
