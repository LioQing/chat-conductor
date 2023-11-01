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
import Panel from '../components/Panel';
import Collapsible from '../components/Collapsible';

function Login() {
  const theme = useTheme();
  const navigate = useNavigate();

  // 0 - username, 1 - password/face
  const [loginStage, setLoginStage] = React.useState(0);

  const handleBack = () => {
    setLoginStage(0);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    event.currentTarget.username.disabled = false;
    const data = new FormData(event.currentTarget);
    event.currentTarget.username.disabled = true;

    console.log({
      username: data.get('username'),
      password: data.get('password'),
      remember: data.get('remember'),
    });

    if (loginStage === 0) {
      // TODO: Check username with backend
      console.log('TODO: Check username with backend');
      setLoginStage(1);
    } else if (loginStage === 1) {
      // TODO: Check password with backend
      console.log('TODO: Check password with backend');
      navigate('/pipeline/');
    } else {
      console.error('Invalid login stage');
    }
  };

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
              <Box component="form" onSubmit={handleSubmit} width="100%">
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  disabled={loginStage > 0}
                  autoFocus
                />
                <Collapsible collapsed={loginStage === 0}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
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
