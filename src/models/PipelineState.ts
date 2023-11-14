import { ComposerAxiosRequest } from '../hooks/useComposerAxios';
import { JsonObject } from '../utils/JsonObject';

export interface PipelineState {
  state: JsonObject;
}

export const getPipelineState = (id: number) =>
  ({
    url: `/conductor/pipeline/state/${id}/`,
    method: 'get',
  }) as ComposerAxiosRequest;
