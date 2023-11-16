import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import OutlinedInput from '@mui/material/OutlinedInput';
import SendIcon from '@mui/icons-material/Send';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { usePython } from 'react-py';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material';
import { useCookies } from 'react-cookie';
import chat from '../python/chat';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  ChatHistory,
  ChatHistoryParams,
  getChatHistory,
} from '../models/ChatHistory';
import { Pipeline } from '../models/Pipeline';
import { ChatSend, ChatSendRequest, postChatSend } from '../models/ChatSend';

export interface ChatProps {
  pipeline: Pipeline;
  onPipelineRun: () => void;
  runInBackend: boolean;
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

function Chat({ pipeline, onPipelineRun, runInBackend }: ChatProps) {
  const theme = useTheme();
  const [cookies] = useCookies();
  const [inputMessage, setInputMessage] = React.useState('');
  const [disabled, setDisabled] = React.useState(true);
  const [messagesHeight, setMessagesHeight] = React.useState(0);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [chatErrorOpened, setChatErrorOpened] = React.useState(false);
  const [chatError, setChatError] = React.useState<string | null>(null);
  const messageRowRef = React.useRef<HTMLDivElement>(null);
  const messagesBottomRef = React.useRef<HTMLDivElement>(null);

  // chat history

  const chatHistoryClient = useComposerAxios<ChatHistory[]>();

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
    const firstAppearedIndex = chatHistoryClient.response.data.findIndex(
      (chatHistory) => `assi${chatHistory.id}` === firstNonTempId,
    );
    const newMessages = chatHistoryClient.response.data
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
  }, [chatHistoryClient.response]);

  React.useEffect(() => {
    fetchChatHistory();
  }, [pipeline]);

  // run in backend

  const chatSendClient = useComposerAxios<ChatSend, ChatSendRequest>();

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

  // run in pyodide

  const python = usePython();
  const [stdoutLength, setStdoutLength] = React.useState(0);

  // this should only be triggered twice (once on first render, second on load)
  React.useEffect(() => {
    if (python.isLoading) {
      setDisabled(true);
      return;
    }

    setDisabled(false);

    // create file system from chat
    const createFs = async (dirModule: object, dir: string = '.') => {
      for (const [name, content] of Object.entries(dirModule)) {
        if (typeof content === 'object') {
          python.mkdir(`${dir}/${name}`);
          createFs(content, `${dir}/${name}`);
        } else if (typeof content === 'string') {
          let text = content;
          if (content.startsWith('# load=')) {
            const url = content.slice(7);
            const response = await fetch(url);
            text = await response.text();
          }

          // convert python relative import to absolute import
          const resolvedDir = dir.replace(/\//g, '.').slice(2);
          if (dir === '.') {
            // `from . import ...` -> `import ...`
            text = text.replace(/from \. import /g, 'import ');

            // `from .<module> import ...` -> `from <module> import ...`
            text = text.replace(/from \.(\w+) import /g, 'from $1 import ');
          } else {
            // `from . import ...` -> `from <dir> import ...`
            text = text.replace(
              /from \. import /g,
              `from ${resolvedDir} import `,
            );

            // `from .<module> import ...` -> `from <dir>.<module> import ...`
            text = text.replace(
              /from \.(\w+) import /g,
              `from ${resolvedDir}.$1 import `,
            );
          }

          python.writeFile(`${dir}/${name}.py`, text);
          if (dir === '.') {
            python.watchModules([`${name}`]);
          } else {
            python.watchModules([`${resolvedDir}.${name}`]);
          }
          console.log(`Created ${dir}/${name}.py`);
        } else {
          console.warn('Unknown module type');
        }
      }
    };
    createFs(chat);
  }, [python.isLoading]);

  React.useEffect(() => {
    if (python.stderr === '') return;

    console.error(python.stderr);
    setChatError('Python Error');
    setChatErrorOpened(true);
  }, [python.stderr]);

  React.useEffect(() => {
    if (python.stdout === '') return;

    console.log(python.stdout.slice(stdoutLength + 1));
    setStdoutLength(python.stdout.length);
  }, [python.stdout]);

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
    setMessages([userMessage, ...messages]);

    setDisabled(true);
    setInputMessage('');

    if (runInBackend) {
      // Call API
      chatSendClient.sendRequest(
        postChatSend(pipeline.id, {
          user_message: userMessage.content,
        } as ChatSendRequest),
      );
    } else {
      // Run with pyodide
      (async () => {
        // run python
        await python.runPython(
          chat.main_template
            .replace(
              /(os.environ\['REACT_APP_COMPOSER_BASE_URL'\] = )''/g,
              `$1'${process.env.REACT_APP_COMPOSER_BASE_URL}'`,
            )
            .replace(
              /(os.environ\['ACCESS_TOKEN'\] = )''/g,
              `$1'${cookies['access-token']}'`,
            )
            .replace(/(pipeline_id=)0/g, `$1${pipeline.id}`)
            .replace(/(user_message=)''/g, `$1'${userMessage.content}'`),
        );

        // done
        fetchChatHistory();
        setDisabled(false);
      })();
    }
  };

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
        disabled={python.isLoading}
        placeholder="Enter your message"
        fullWidth
        endAdornment={
          <Box display="flex" flexDirection="row" justifyContent="flex-end">
            <InputAdornment position="end">
              {python.isLoading && (
                <Box
                  px={1}
                  py={0.25}
                  sx={{
                    border: 1,
                    borderRadius: 8,
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography variant="body2" color="primary.main">
                    Loading Python...
                  </Typography>
                </Box>
              )}
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
            {messages
              .slice(0)
              .reverse()
              .map((message: Message, i: number) => (
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
