import { ComposerAxiosRequest } from '../hooks/useComposerAxios';
import { JsonObject } from '../utils/JsonObject';

export interface PipelineAttributes {
  state: JsonObject;
  description: string;
}

export const getPipelineAttributes = (id: number) =>
  ({
    url: `/conductor/pipeline/attributes/${id}/`,
    method: 'get',
  }) as ComposerAxiosRequest;
