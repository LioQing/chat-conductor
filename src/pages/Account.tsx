import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import TextField from '@mui/material/TextField';
import { alpha } from '@mui/material';
import Collapsible from '../components/Collapsible';
import Panel from '../components/Panel';
import User from '../models/User';

function Account() {
  const theme = useTheme();
  const [passwordHeight, setPasswordHeight] = React.useState(0);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const changePasswordRef = React.useRef<HTMLDivElement>(null);

  // TODO: Get user data from backend
  console.log('TODO: Get user data from backend');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = React.useState<User>({
    username: 'test_account',
    name: 'Test Account',
    email: 'test@test.com',
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    // TODO: Add password change
    console.log('TODO: Add password change');
    console.log({
      username: data.get('oldPassword'),
      password: data.get('newPassword'),
      remember: data.get('confirmPassword'),
    });
    setChangingPassword(false);
  };

  const changePasswordPanel = (
    <Box ref={changePasswordRef} p="8px">
      <Panel>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="oldPassword"
            label="Old Password"
            name="oldPassword"
            autoComplete="current-password"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="newPassword"
            label="New Password"
            name="newPassword"
            autoComplete="new-password"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="confirmPassword"
            label="Confirm Password"
            name="confirmPassword"
            autoComplete="new-password"
          />
          <Box display="flex" flexDirection="row" gap={1} mt={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setChangingPassword(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </Box>
        </Box>
      </Panel>
    </Box>
  );

  return (
    <Panel title={user.name}>
      <Box display="flex" flexDirection="row" mb={1}>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row">
            <Box mr={1}>Username:</Box>
            <Box>{user.username}</Box>
          </Box>
          <Box display="flex" flexDirection="row">
            <Box mr={1}>Email:</Box>
            <Box>{user.email}</Box>
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" justifyItems="left">
        <Typography variant="h6" gutterBottom>
          Security
        </Typography>
        <Box display="flex" flexDirection="column">
          <Box
            display="flex"
            flexDirection="row"
            gap={1}
            width="100%"
            justifyContent="flex-start"
          >
            <Button
              variant="outlined"
              onClick={() => setChangingPassword(!changingPassword)}
              sx={{
                backgroundColor: changingPassword
                  ? alpha(
                      theme.palette.primary.main,
                      theme.palette.action.selectedOpacity,
                    )
                  : undefined,
              }}
            >
              Change Password
            </Button>
          </Box>
          <Box
            width="100%"
            height={`calc(${passwordHeight}px - 16px)`}
            sx={{ transition: theme.transitions.create('all') }}
          >
            <Box width="100%" height="8px" />
            <Box position="relative" left="-8px" top="-8px">
              <Collapsible
                collapsed={!changingPassword}
                extraHeight={16}
                onCollapse={(width: number, height: number) => {
                  setPasswordHeight(height);
                }}
                sx={{
                  width: 'calc(100% + 16px)',
                }}
              >
                {changePasswordPanel}
              </Collapsible>
            </Box>
          </Box>
        </Box>
      </Box>
    </Panel>
  );
}

export default Account;
