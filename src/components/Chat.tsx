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
import { alpha, useTheme } from '@mui/material';
import Panel from './Panel';
import Message, { Role } from '../models/Message';

export interface ChatProps {
  height: number;
}

function Chat({ height }: ChatProps) {
  const theme = useTheme();
  const [inputMessage, setInputMessage] = React.useState('');
  const [disabled, setDisabled] = React.useState(false);
  const [messagesHeight, setMessagesHeight] = React.useState(0);
  // TODO: Get from backend
  const [messages, setMessages] = React.useState<Message[]>([]);
  const messageRowRef = React.useRef<HTMLDivElement>(null);
  const messagesBottomRef = React.useRef<HTMLDivElement>(null);

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

    // TODO: Send to backend
    console.log('TODO: Send to backend');
    const userMessage = {
      id: messages.length + 1,
      role: Role.User,
      content: inputMessage,
    } as Message;
    setMessages([...messages, userMessage]);

    setDisabled(true);
    setTimeout(() => {
      setMessages([
        ...messages,
        userMessage,
        {
          id: messages.length + 2,
          role: Role.Assistant,
          content: `Sample assistant response: ${inputMessage}`,
        } as Message,
      ]);
      setDisabled(false);
    }, 500);

    setInputMessage('');
  };

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
            {messages.map((message) => (
              <Box
                key={message.id}
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
                  }}
                >
                  {message.content}
                </Paper>
              </Box>
            ))}
            <Box position="relative" top="100%" ref={messagesBottomRef} />
          </Box>
        </Box>
        {messageRow}
      </Box>
    </Panel>
  );
}

export default Chat;
