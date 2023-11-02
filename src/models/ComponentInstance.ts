import { ComposerAxiosRequest } from '../hooks/useComposerAxios';
import { Component } from './Component';

export interface ComponentInstance extends Component {
  component_id: number;
  is_enabled: boolean;
  order: number;
}

export const getComponentInstance = (pipeline: number) =>
  ({
    url: `/conductor/pipeline/component-instance/${pipeline}/`,
    method: 'get',
  }) as ComposerAxiosRequest;

export const deleteComponentInstanceDelete = (id: number) =>
  ({
    url: `/conductor/pipeline/component-instance/delete/${id}/`,
    method: 'delete',
  }) as ComposerAxiosRequest;
