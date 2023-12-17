import { ComposerAxiosRequest } from '../hooks/useComposerAxios';

export interface ChatSendRequest {
  user_message: string;
}

export interface ChatSend {
  user_message: string;
}

export const postChatSend = (id: number, data: ChatSendRequest) =>
  ({
    url: `/conductor/chat/send/${id}/`,
    method: 'post',
    data,
  }) as ComposerAxiosRequest<ChatSendRequest>;
