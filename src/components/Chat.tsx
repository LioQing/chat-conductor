import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import OutlinedInput from '@mui/material/OutlinedInput';
import SendIcon from '@mui/icons-material/Send';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  ChatHistory,
  ChatHistoryParams,
  getChatHistory,
} from '../models/ChatHistory';
import { Pipeline } from '../models/Pipeline';
import { ChatSend, ChatSendRequest, postChatSend } from '../models/ChatSend';
import usePrevious from '../hooks/usePrevious';

const pageSize = 25;
const messageRowPadding = 16;
const messageRowMaxRows = 3;

export interface ChatProps {
  pipeline: Pipeline;
  onPipelineRun: () => void;
}

enum Role {
  User,
  Assistant,
}

interface Message {
  id: string; // `user${chat history id}` or `assi${chat history id}` or `usertemp${index}`
  role: Role;
  content: string;
}

function Chat({ pipeline, onPipelineRun }: ChatProps) {
  const theme = useTheme();
  const [inputMessage, setInputMessage] = React.useState('');
  const [disabled, setDisabled] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [chatErrorOpened, setChatErrorOpened] = React.useState(false);
  const [chatError, setChatError] = React.useState<string | null>(null);
  const prevMessages = usePrevious(messages);
  const messagesBottomRef = React.useRef<HTMLDivElement>(null);
  const messageRowRef = React.useRef<HTMLTextAreaElement | HTMLInputElement>(
    null,
  );

  // first chat page

  const firstChatPageClient = useComposerAxios<ChatHistory[]>();

  const fetchFirstChatPage = () => {
    firstChatPageClient.sendRequest(
      getChatHistory(pipeline.id, {
        page: 1,
        page_size: pageSize,
      } as ChatHistoryParams),
    );
  };

  React.useEffect(() => {
    if (!firstChatPageClient.response) return;

    // replace messages if it is empty
    if (messages.length === 0) {
      setMessages(
        firstChatPageClient.response.data.flatMap((chatHistory) => [
          {
            id: `assi${chatHistory.id}`,
            role: Role.Assistant,
            content: chatHistory.api_message,
          },
          {
            id: `user${chatHistory.id}`,
            role: Role.User,
            content: chatHistory.user_message,
          },
        ]),
      );
      return;
    }

    // else remove any "tempuser" message and then append new messages not in messages
    const firstNonTempId =
      messages.find((message) => !message.id.startsWith('usertemp'))?.id ?? '';
    const firstAppearedIndex = firstChatPageClient.response.data.findIndex(
      (chatHistory) => `assi${chatHistory.id}` === firstNonTempId,
    );
    const newMessages = firstChatPageClient.response.data
      .slice(0, firstAppearedIndex)
      .flatMap((chatHistory) => [
        {
          id: `assi${chatHistory.id}`,
          role: Role.Assistant,
          content: chatHistory.api_message,
        },
        {
          id: `user${chatHistory.id}`,
          role: Role.User,
          content: chatHistory.user_message,
        },
      ]);

    setMessages([
      ...newMessages,
      ...messages.filter((message) => !message.id.startsWith('usertemp')),
    ]);

    onPipelineRun();
  }, [firstChatPageClient.response]);

  // more chat page

  const moreChatPageClient = useComposerAxios<ChatHistory[]>();
  const [hasMore, setHasMore] = React.useState(true);

  // if it is fetching the first page, then fetch after it is done
  const [fetchAfterFirstPage, setFetchAfterFirstPage] = React.useState(false);

  const fetchMoreChatPage = () => {
    if (firstChatPageClient.loading) {
      setFetchAfterFirstPage(true);
      return;
    }

    if (moreChatPageClient.loading) {
      return;
    }

    moreChatPageClient.sendRequest(
      getChatHistory(pipeline.id, {
        page: Math.floor(messages.length / pageSize / 2) + 1,
        page_size: pageSize,
      } as ChatHistoryParams),
    );
  };

  React.useEffect(() => {
    fetchMoreChatPage();
  }, [pipeline]);

  React.useEffect(() => {
    if (!moreChatPageClient.response) return;

    if (moreChatPageClient.response.data.length === 0) {
      setHasMore(false);
      return;
    }

    // there is not messages, then just append
    if (messages.length === 0) {
      setMessages(
        moreChatPageClient.response.data.flatMap((chatHistory) => [
          {
            id: `assi${chatHistory.id}`,
            role: Role.Assistant,
            content: chatHistory.api_message,
          },
          {
            id: `user${chatHistory.id}`,
            role: Role.User,
            content: chatHistory.user_message,
          },
        ]),
      );
      return;
    }

    // do not push duplicated messages
    const lastMessageId = messages[messages.length - 1].id;
    const lastDupIndex = moreChatPageClient.response.data.findLastIndex(
      (chatHistory: ChatHistory) => `assi${chatHistory.id}` === lastMessageId,
    );

    setMessages([
      ...messages,
      ...moreChatPageClient.response.data
        .slice(lastDupIndex + 1)
        .flatMap((chatHistory) => [
          {
            id: `assi${chatHistory.id}`,
            role: Role.Assistant,
            content: chatHistory.api_message,
          },
          {
            id: `user${chatHistory.id}`,
            role: Role.User,
            content: chatHistory.user_message,
          },
        ]),
    ]);
  }, [moreChatPageClient.response]);

  React.useEffect(() => {
    if (!fetchAfterFirstPage || firstChatPageClient.loading) return;

    setFetchAfterFirstPage(false);
    fetchMoreChatPage();
  }, [firstChatPageClient]);

  // run in backend

  const chatSendClient = useComposerAxios<ChatSend, ChatSendRequest>();

  React.useEffect(() => {
    if (!chatSendClient.response) return;

    fetchFirstChatPage();
    setDisabled(false);
  }, [chatSendClient.response]);

  React.useEffect(() => {
    if (!chatSendClient.error) return;

    // Remove temp user message
    setMessages(
      messages.filter((message) => !message.id.startsWith('usertemp')),
    );

    setChatError(chatSendClient.error.toString());
    setChatErrorOpened(true);
    setDisabled(false);
  }, [chatSendClient.error]);

  const handleInputMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleInputMessageHeight = () => {
    if (!messageRowRef.current) return;

    const target = messageRowRef.current as
      | HTMLTextAreaElement
      | HTMLInputElement;

    // reset height
    target.style.height = '1px';

    // get heights and rows
    const heightWithoutPaddings = target.scrollHeight - messageRowPadding * 2;
    const lineHeight = parseInt(
      window.getComputedStyle(target).lineHeight.slice(0, -2),
      10,
    );
    const rows = heightWithoutPaddings / lineHeight;

    // max rows
    if (rows <= messageRowMaxRows) {
      target.style.height = `${heightWithoutPaddings}px`;
    } else if (target.value.length === 0 || rows === 0) {
      target.style.height = `${lineHeight}px`;
    } else {
      target.style.height = `${lineHeight * messageRowMaxRows}px`;
    }
  };

  React.useEffect(() => {
    handleInputMessageHeight();
  }, [inputMessage, pipeline]);

  const handleKeyMessage = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (e.key === 'Enter' && !disabled && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const { value } = target;

      const cursorPosition = target.selectionStart;
      const cursorEndPosition = target.selectionEnd;
      const tab = '\t';

      target.value =
        value.substring(0, cursorPosition) +
        tab +
        value.substring(cursorEndPosition);

      target.selectionStart = cursorPosition + 1;
      target.selectionEnd = cursorPosition + 1;
      setInputMessage(target.value);
    }
  };

  const handleSend = () => {
    if (inputMessage.length === 0) {
      return;
    }

    // Set temp user message
    const userMessage = {
      id: `usertemp${messages.length}`,
      role: Role.User,
      content: inputMessage,
    } as Message;
    setMessages([userMessage, ...messages]);

    setDisabled(true);
    setInputMessage('');

    // Call API
    chatSendClient.sendRequest(
      postChatSend(pipeline.id, {
        user_message: userMessage.content,
      } as ChatSendRequest),
    );
  };

  React.useEffect(() => {
    // skip if the update is the new message
    if (
      prevMessages?.at(0)?.id.startsWith('usertemp') ||
      prevMessages?.at(0)?.id === messages.at(0)?.id
    ) {
      return;
    }

    messagesBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const messageRow = (
    <Box display="flex" flexDirection="row">
      <OutlinedInput
        value={inputMessage}
        onChange={handleInputMessage}
        onKeyDown={handleKeyMessage}
        placeholder="Enter your message"
        fullWidth
        inputComponent="textarea"
        inputProps={{
          ref: messageRowRef,
          style: {
            resize: 'none',
            minHeight: `1em`,
            padding: `${messageRowPadding}px`,
            scrollPadding: `${messageRowPadding}px`,
          },
        }}
        endAdornment={
          <Box display="flex" flexDirection="row" justifyContent="flex-end">
            <InputAdornment position="end">
              <Tooltip
                placement="top"
                title={
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Typography color="inherit">Send</Typography>
                    <Typography
                      sx={{
                        fontSize: theme.typography.pxToRem(12),
                        border: `1px solid ${alpha(
                          theme.palette.text.secondary,
                          0.2,
                        )}`,
                        backgroundColor: alpha(
                          theme.palette.background.paper,
                          0.3,
                        ),
                        height: '19px',
                        lineHeight: '19px',
                        padding: '0 4px',
                        minWidth: 17,
                        borderRadius: theme.shape.borderRadius,
                        display: 'inline-block',
                      }}
                    >
                      Return
                    </Typography>
                  </Box>
                }
              >
                <Box>
                  <IconButton
                    onClick={handleSend}
                    disabled={disabled}
                    sx={{
                      color: disabled
                        ? theme.palette.action.disabled
                        : theme.palette.primary.main,
                      transitions: theme.transitions.create('all'),
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Tooltip>
            </InputAdornment>
          </Box>
        }
      />
    </Box>
  );

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        minHeight={0}
        gap={1}
      >
        <Box
          border="1px solid"
          borderColor={theme.palette.primary.main}
          borderRadius={1}
          flexGrow={1}
          overflow="hidden"
        >
          <Box
            id="messages"
            display="flex"
            flexDirection="column-reverse"
            height="100%"
            sx={{ overflowY: 'scroll' }}
          >
            <Box position="relative" ref={messagesBottomRef} />
            <InfiniteScroll
              dataLength={messages.length}
              next={fetchMoreChatPage}
              hasMore={hasMore}
              loader={
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <CircularProgress />
                </Box>
              }
              scrollableTarget="messages"
              inverse
              style={{
                display: 'flex',
                flexDirection: 'column-reverse',
                padding: '8px',
                gap: '8px',
              }}
            >
              {messages.map((message: Message, i: number) => (
                <Box
                  key={i}
                  display="flex"
                  flexDirection="row"
                  justifyContent={
                    message.role === Role.User ? 'flex-end' : 'flex-start'
                  }
                >
                  <Paper
                    sx={{
                      p: 1,
                      maxWidth: 'calc(100% - 16px)',
                      backgroundColor:
                        message.role === Role.User ? 'primary.main' : undefined,
                      color:
                        message.role === Role.User
                          ? 'primary.contrastText'
                          : 'patlette.text.primary',
                      overflowWrap: 'break-word',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="inherit"
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {message.content}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </InfiniteScroll>
          </Box>
        </Box>
        {messageRow}
      </Box>
      <Snackbar
        open={chatErrorOpened}
        autoHideDuration={6000}
        onClose={() => setChatErrorOpened(false)}
      >
        <Alert onClose={() => setChatErrorOpened(false)} severity="error">
          {chatError}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Chat;
