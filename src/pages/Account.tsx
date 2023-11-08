import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useTheme from '@mui/material/styles/useTheme';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material';
import Collapsible from '../components/Collapsible';
import Panel from '../components/Panel';
import { Account as AccountModel, getAccount } from '../models/Account';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  AccountPasswordChangeRequest,
  patchAccountPasswordChange,
} from '../models/AccountPasswordChange';

function Account() {
  const theme = useTheme();
  const [passwordHeight, setPasswordHeight] = React.useState(0);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [newPasswordError, setNewPasswordError] = React.useState<string | null>(
    null,
  );
  const [oldPasswordError, setOldPasswordError] = React.useState<string | null>(
    null,
  );
  const [confirmPasswordError, setConfirmPasswordError] = React.useState<
    string | null
  >(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] =
    React.useState<boolean>(false);
  const changePasswordRef = React.useRef<HTMLDivElement>(null);

  const [account, setAccount] = React.useState<AccountModel>({
    id: 0,
    username: '',
    name: '',
    email: '',
    is_whitelisted: false,
    date_joined: new Date().toISOString(),
  });

  const accountClient = useComposerAxios<AccountModel>(getAccount());
  const accountPasswordChangeClient = useComposerAxios<
    {},
    AccountPasswordChangeRequest
  >();

  React.useEffect(() => {
    accountClient.sendRequest();
  }, []);

  React.useEffect(() => {
    if (!accountClient.response) return;

    setAccount(accountClient.response.data);
  }, [accountClient.response]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    // validation
    setOldPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);
    let areValid = true;

    if (!data.get('oldPassword')) {
      setOldPasswordError('This field may not be blank');
      areValid = false;
    }

    if (!data.get('newPassword')) {
      setNewPasswordError('This field may not be blank');
      areValid = false;
    }

    if (!data.get('confirmPassword')) {
      setConfirmPasswordError('This field may not be blank');
      areValid = false;
    }

    if (data.get('newPassword') !== data.get('confirmPassword')) {
      setConfirmPasswordError('Passwords do not match');
      areValid = false;
    }

    if (!areValid) {
      return;
    }

    // send request
    const request = {
      old_password: data.get('oldPassword'),
      new_password: data.get('newPassword'),
    } as AccountPasswordChangeRequest;
    accountPasswordChangeClient.sendRequest(
      patchAccountPasswordChange(request),
    );
  };

  React.useEffect(() => {
    if (!accountPasswordChangeClient.response) return;

    if (accountPasswordChangeClient.response.status === 200) {
      setChangingPassword(false);
      setOldPasswordError(null);
      setNewPasswordError(null);
      setConfirmPasswordError(null);
      changePasswordRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      setPasswordChangeSuccess(true);
    }
  }, [accountPasswordChangeClient.response]);

  React.useEffect(() => {
    if (!accountPasswordChangeClient.error) return;

    console.log(accountPasswordChangeClient.error);
    if (accountPasswordChangeClient.error.response?.status === 400) {
      const { data } = accountPasswordChangeClient.error.response;
      setOldPasswordError((data as any).detail);
    } else {
      setOldPasswordError(accountPasswordChangeClient.error.message);
    }
  }, [accountPasswordChangeClient.error]);

  const handlePasswordChangeSuccessClose = () => {
    setPasswordChangeSuccess(false);
  };

  const changePasswordPanel = (
    <Box ref={changePasswordRef} p="8px">
      <Panel>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            fullWidth
            id="oldPassword"
            label="Old Password"
            name="oldPassword"
            type="password"
            autoComplete="current-password"
            error={!!oldPasswordError}
            helperText={oldPasswordError}
          />
          <TextField
            margin="normal"
            fullWidth
            id="newPassword"
            label="New Password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            error={!!newPasswordError}
            helperText={newPasswordError}
          />
          <TextField
            margin="normal"
            fullWidth
            id="confirmPassword"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
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
    <>
      <Box display="flex" flexDirection="column" gap={2} width="100%">
        <Panel title={account.name}>
          <Box display="flex" flexDirection="row" mb={1}>
            <Box display="flex" flexDirection="column">
              <Box display="flex" flexDirection="row">
                <Box mr={1}>Username:</Box>
                <Box>{account.username}</Box>
              </Box>
              <Box display="flex" flexDirection="row">
                <Box mr={1}>Email:</Box>
                <Box>{account.email}</Box>
              </Box>
              <Box display="flex" flexDirection="row">
                <Box mr={1}>User ID:</Box>
                <Box>{account.id}</Box>
              </Box>
              <Box display="flex" flexDirection="row">
                <Box mr={1}>Is Whitelisted:</Box>
                <Box>{account.is_whitelisted ? 'Yes' : 'No'}</Box>
              </Box>
              <Box display="flex" flexDirection="row">
                <Box mr={1}>Date Joined:</Box>
                <Box>{new Date(account.date_joined).toLocaleString()}</Box>
              </Box>
            </Box>
          </Box>
        </Panel>
        <Panel title="Security">
          <Box display="flex" flexDirection="column">
            <Box
              display="flex"
              flexDirection="row"
              gap={1}
              width="100%"
              justifyContent="flex-start"
              alignItems="center"
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
              <Box width="100%" height="16px" />
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
        </Panel>
      </Box>
      <Snackbar
        open={!!passwordChangeSuccess}
        autoHideDuration={6000}
        onClose={handlePasswordChangeSuccessClose}
      >
        <Alert severity="success" onClose={handlePasswordChangeSuccessClose}>
          Password changed successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default Account;
