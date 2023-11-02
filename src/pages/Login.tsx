import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import useTheme from '@mui/material/styles/useTheme';
import LinearProgress from '@mui/material/LinearProgress';
import { useCookies } from 'react-cookie';
import Panel from '../components/Panel';
import Collapsible from '../components/Collapsible';
import useAxios from '../hooks/useAxios';
import {
  UsernameExistsRequest,
  UsernameExists,
  postUsernameExists,
} from '../models/AuthUsernameExists';
import {
  LoginRequest,
  Login as LoginModel,
  postLogin,
} from '../models/AuthLogin';
import { handleException } from '../models/Exception';

function Login() {
  const theme = useTheme();
  const [, setCookies] = useCookies();
  const navigate = useNavigate();

  // 0 - username, 1 - password
  const [loginStage, setLoginStage] = React.useState(0);
  const usernameClient = useAxios<UsernameExists, UsernameExistsRequest>();
  const [usernameError, setUsernameError] = React.useState<string | null>(null);
  const passwordClient = useAxios<LoginModel, LoginRequest>();
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const handleBack = () => {
    setLoginStage(0);
    setPasswordError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loginStage === 0) {
      const data = new FormData(event.currentTarget);

      // validation
      if (!data.get('username')) {
        setUsernameError('This field may not be blank');
        return;
      }

      // request
      usernameClient.sendRequest(
        postUsernameExists({ username: data.get('username') as string }),
      );
    } else if (loginStage === 1) {
      event.currentTarget.username.disabled = false;
      const data = new FormData(event.currentTarget);
      event.currentTarget.username.disabled = true;

      // validation
      if (!data.get('password')) {
        setPasswordError('This field may not be blank');
        return;
      }
      setPasswordError(null);

      // request
      passwordClient.sendRequest(
        postLogin({
          username: data.get('username') as string,
          password: data.get('password') as string,
        }),
      );
    } else {
      console.error('Invalid login stage');
    }
  };

  React.useEffect(() => {
    if (usernameClient.error) {
      setUsernameError(handleException(usernameClient));
    } else if (usernameClient.response?.data) {
      if (usernameClient.response.data.exists) {
        setUsernameError(null);
        setLoginStage(1);
      } else {
        setUsernameError('Username does not exist');
      }
    }
  }, [usernameClient.response, usernameClient.error]);

  React.useEffect(() => {
    if (passwordClient.error) {
      if (passwordClient.error.response?.status === 401) {
        setPasswordError('Incorrect password');
      } else {
        setPasswordError(handleException(passwordClient));
      }
    } else if (passwordClient.response?.data) {
      setCookies('access-token', passwordClient.response.data.access, {
        path: '/',
        expires: new Date(passwordClient.response.data.access_expiration),
      });
      setCookies('refresh-token', passwordClient.response.data.refresh, {
        path: '/',
        expires: new Date(passwordClient.response.data.refresh_expiration),
      });
      navigate('/pipeline/');
    }
  }, [passwordClient.response, passwordClient.error]);

  return (
    <Container>
      <CssBaseline />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={3}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          textAlign="center"
          flexGrow={1}
        >
          <Typography variant="h2">Chat Conductor</Typography>
          <Typography variant="subtitle1">By Gennarrator A</Typography>
        </Box>
        <Box width={500}>
          <Panel>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5" gutterBottom>
                Login
              </Typography>
              <LinearProgress
                style={{
                  width: '100%',
                  visibility:
                    usernameClient.loading || passwordClient.loading
                      ? 'visible'
                      : 'hidden',
                }}
              />
              <Box component="form" onSubmit={handleSubmit} width="100%">
                <TextField
                  margin="normal"
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  disabled={loginStage > 0}
                  autoFocus
                  error={!!usernameError}
                  helperText={usernameError}
                />
                <Collapsible collapsed={loginStage === 0}>
                  <TextField
                    margin="normal"
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    autoFocus
                    error={!!passwordError}
                    helperText={passwordError}
                  />
                </Collapsible>
                <Box display="flex" flexDirection="row" mt={3} gap={2}>
                  <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    name="remember"
                    label="Remember me"
                    id="remember"
                  />
                  <Box flexGrow={1} />
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{
                      width: 100,
                      visibility: loginStage === 0 ? 'hidden' : 'visible',
                      opacity: loginStage === 0 ? 0 : 1,
                      transition: theme.transitions.create('all'),
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" variant="contained" sx={{ width: 100 }}>
                    {loginStage === 0 ? 'Next' : 'Login'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Panel>
        </Box>
        <Box flexGrow={1} />
      </Box>
    </Container>
  );
}

export default Login;
