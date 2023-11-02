import { ComposerAxiosRequest } from '../hooks/useComposerAxios';
import { ComponentInstance } from './ComponentInstance';

export interface ComponentInstanceNewRequest {
  template_component_id: number | '';
}

export interface ComponentInstanceNew extends ComponentInstance {
  template_component_id: number | '';
}

export const postComponentInstanceNew = (
  pipeline: number,
  data: ComponentInstanceNewRequest,
) =>
  ({
    url: `/conductor/pipeline/component-instance/new/${pipeline}/`,
    method: 'post',
    data,
  }) as ComposerAxiosRequest<ComponentInstanceNewRequest>;
