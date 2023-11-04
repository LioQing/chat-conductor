import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import OutlinedInput from '@mui/material/OutlinedInput';
import SendIcon from '@mui/icons-material/Send';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material';
import Panel from './Panel';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  ChatHistory,
  ChatHistoryParams,
  getChatHistory,
} from '../models/ChatHistory';
import { Pipeline } from '../models/Pipeline';
import { ChatSend, ChatSendRequest, postChatSend } from '../models/ChatSend';

export interface ChatProps {
  height: number;
  pipeline: Pipeline;
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

function Chat({ height, pipeline }: ChatProps) {
  const theme = useTheme();
  const [inputMessage, setInputMessage] = React.useState('');
  const [disabled, setDisabled] = React.useState(false);
  const [messagesHeight, setMessagesHeight] = React.useState(0);
  // TODO: Get from backend
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [chatErrorOpened, setChatErrorOpened] = React.useState(false);
  const [chatError, setChatError] = React.useState<string | null>(null);
  const messageRowRef = React.useRef<HTMLDivElement>(null);
  const messagesBottomRef = React.useRef<HTMLDivElement>(null);

  const chatHistoryClient = useComposerAxios<ChatHistory[]>();
  const chatSendClient = useComposerAxios<ChatSend, ChatSendRequest>();

  const fetchChatHistory = () => {
    chatHistoryClient.sendRequest(
      getChatHistory(pipeline.id, {
        page: 1,
        page_size: 20,
      } as ChatHistoryParams),
    );
  };

  React.useEffect(() => {
    if (!chatHistoryClient.response) return;

    // replace messages if it is empty
    if (messages.length === 0) {
      setMessages(
        chatHistoryClient.response.data.flatMap((chatHistory) => [
          {
            id: `user${chatHistory.id}`,
            role: Role.User,
            content: chatHistory.user_message,
          },
          {
            id: `assi${chatHistory.id}`,
            role: Role.Assistant,
            content: chatHistory.api_message,
          },
        ]),
      );
      return;
    }

    // else remove any "tempuser" message and then append new messages not in messages
    const firstNotAppearedIndex = chatHistoryClient.response.data.findIndex(
      (chatHistory) =>
        !messages.some((message) => message.id === `user${chatHistory.id}`),
    );
    const newMessages = chatHistoryClient.response.data
      .slice(firstNotAppearedIndex)
      .flatMap((chatHistory) => [
        {
          id: `user${chatHistory.id}`,
          role: Role.User,
          content: chatHistory.user_message,
        },
        {
          id: `assi${chatHistory.id}`,
          role: Role.Assistant,
          content: chatHistory.api_message,
        },
      ]);

    setMessages([
      ...messages.filter((message) => !message.id.startsWith('usertemp')),
      ...newMessages,
    ]);
  }, [chatHistoryClient.response]);

  React.useEffect(() => {
    fetchChatHistory();
  }, [pipeline]);

  const handleInputMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleKeyMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      handleSend();
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
    setMessages([...messages, userMessage]);

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
    if (!chatSendClient.response) return;

    fetchChatHistory();
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

  const handleClearHistory = () => {};

  React.useEffect(() => {
    messagesBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  React.useLayoutEffect(() => {
    if (messageRowRef.current) {
      setMessagesHeight(messageRowRef.current.offsetHeight);
    }
  }, [messages]);

  const messageRow = (
    <Box ref={messageRowRef} display="flex" flexDirection="row">
      <OutlinedInput
        value={inputMessage}
        onChange={handleInputMessage}
        onKeyDown={handleKeyMessage}
        placeholder="Enter your message"
        fullWidth
        endAdornment={
          <Box display="flex" flexDirection="row" justifyContent="flex-end">
            <InputAdornment position="end">
              <Tooltip placement="top" title="Clear history">
                <IconButton onClick={handleClearHistory}>
                  <LayersClearIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
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
                    color={disabled ? undefined : 'primary'}
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
      <Panel
        title="Chat"
        sx={{ width: '30%', height }}
        wrapper={<Box display="flex" flexDirection="column" height="100%" />}
      >
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          minHeight={0}
          gap={1}
        >
          <Box
            height={`calc(100% - ${messagesHeight}px - 8px)`}
            sx={{ overflowY: 'scroll' }}
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-end"
              p={1}
              gap={1}
            >
              {messages.map((message, i) => (
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
              <Box position="relative" top="100%" ref={messagesBottomRef} />
            </Box>
          </Box>
          {messageRow}
        </Box>
      </Panel>
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
