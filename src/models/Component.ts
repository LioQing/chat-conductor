import { ComposerAxiosRequest } from '../hooks/useComposerAxios';
import { ArgumentObject } from '../utils/Argument';
import { JsonObject } from '../utils/JsonObject';

export interface Component {
  id: number;
  function_name: string;
  name: string;
  arguments: ArgumentObject;
  return_type: string;
  description: string;
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
