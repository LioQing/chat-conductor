import { ComposerAxiosRequest } from '../hooks/useComposerAxios';
import { JsonObject } from '../utils/JsonObject';

export interface Component {
  id: number;
  function_name: string;
  name: string;
  arguments: JsonObject;
  return_type: string;
  description: JsonObject;
  code: string;
  state: JsonObject;
  is_template: boolean;
  created_at: string;
}

export const getComponent = (id: number) =>
  ({
    url: `/conductor/component/details/${id}/`,
    method: 'get',
  }) as ComposerAxiosRequest;
