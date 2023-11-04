import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface ChatHistoryParams {
  page: number;
  page_size: number;
}

export interface ChatHistory {
  id: number;
  user_message: string;
  api_message: string;
  clear_history: boolean;
  created_at: string;
}

export const getChatHistory = (id: number, params: ChatHistoryParams) =>
  ({
    url: `/conductor/chat/history/${id}/`,
    method: 'get',
    params,
  }) as ComposerAxiosRequest;
