import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useTheme from '@mui/material/styles/useTheme';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import OutlinedInput from '@mui/material/OutlinedInput';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { Collapse, alpha } from '@mui/material';
import Panel from '../components/Panel';
import { Account as AccountModel, getAccount } from '../models/Account';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  AccountPasswordChangeRequest,
  patchAccountPasswordChange,
} from '../models/AccountPasswordChange';
import {
  AccountApiKeyReveal,
  postAccountApiKeyReveal,
} from '../models/AccountApiKeyReveal';
import {
  AccountApiKeyRefresh,
  postAccountApiKeyRefresh,
} from '../models/AccountApiKeyRefresh';

function Account() {
  const theme = useTheme();
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [apiKeyRevealed, setApiKeyRevealed] = React.useState(false);
  const [passwordForApiKey, setPasswordForApiKey] = React.useState<
    'reveal' | 'refresh' | 'copy' | null
  >(null);
  const [isApiKeyCopying, setIsApiKeyCopying] = React.useState(false);
  const [apiKeyCopied, setApiKeyCopied] = React.useState(false);
  const [apiKeyCopiedTimer, setApiKeyCopiedTimer] =
    React.useState<NodeJS.Timeout | null>(null);
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
  const [apiKeyError, setApiKeyError] = React.useState<string | null>(null);
  const [apiKeyPasswordError, setApiKeyPasswordError] = React.useState<
    string | null
  >(null);
  const [apiKeyRefreshSuccess, setApiKeyRefreshSuccess] =
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

  // account

  const accountClient = useComposerAxios<AccountModel>(getAccount());

  React.useEffect(() => {
    if (!accountClient.response) return;

    setAccount(accountClient.response.data);
  }, [accountClient.response]);

  // password change

  const accountPasswordChangeClient = useComposerAxios<
    {},
    AccountPasswordChangeRequest
  >();

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

    console.error(accountPasswordChangeClient.error);
    if (accountPasswordChangeClient.error.response?.status === 400) {
      const { data } = accountPasswordChangeClient.error.response;
      setOldPasswordError((data as any).detail);
    } else {
      setOldPasswordError(accountPasswordChangeClient.error.message);
    }
  }, [accountPasswordChangeClient.error]);

  // api key reveal

  const accountApiKeyRevealClient = useComposerAxios<AccountApiKeyReveal>();

  React.useEffect(() => {
    if (!accountApiKeyRevealClient.response) return;

    if (accountApiKeyRevealClient.response.status === 200) {
      setApiKey(accountApiKeyRevealClient.response.data.api_key);
      setApiKeyRevealed(!isApiKeyCopying);
      if (isApiKeyCopying) {
        setIsApiKeyCopying(false);
        setApiKeyCopied(true);
        if (apiKeyCopiedTimer) {
          clearTimeout(apiKeyCopiedTimer);
        }
        setApiKeyCopiedTimer(
          setTimeout(() => {
            setApiKeyCopied(false);
          }, 3000),
        );
        navigator.clipboard.writeText(
          accountApiKeyRevealClient.response.data.api_key,
        );
      }
    }
  }, [accountApiKeyRevealClient.response]);

  React.useEffect(() => {
    if (!accountApiKeyRevealClient.error) return;

    if (
      Object.prototype.hasOwnProperty.call(
        accountApiKeyRevealClient.error.response?.data,
        'detail',
      )
    ) {
      const { data } = accountApiKeyRevealClient.error.response as any;
      setApiKeyError(data.detail);
    } else {
      setApiKeyError(accountApiKeyRevealClient.error.message);
    }
  }, [accountApiKeyRevealClient.error]);

  // api key refresh

  const accountApiKeyRefreshClient = useComposerAxios<AccountApiKeyRefresh>();

  React.useEffect(() => {
    if (!accountApiKeyRefreshClient.response) return;

    if (accountApiKeyRefreshClient.response.status === 200) {
      setApiKeyRefreshSuccess(true);
      setApiKey(accountApiKeyRefreshClient.response.data.api_key);
    }
  }, [accountApiKeyRefreshClient.response]);

  React.useEffect(() => {
    if (!accountApiKeyRefreshClient.error) return;

    if (
      Object.prototype.hasOwnProperty.call(
        accountApiKeyRefreshClient.error.response?.data,
        'detail',
      )
    ) {
      const { data } = accountApiKeyRefreshClient.error.response as any;
      setApiKeyError(data.detail);
    } else {
      setApiKeyError(accountApiKeyRefreshClient.error.message);
    }
  }, [accountApiKeyRefreshClient.error]);

  const handlePasswordChangeSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
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

  const handlePasswordChangeSuccessClose = () => {
    setPasswordChangeSuccess(false);
  };

  const handleApiKeyCopy = () => {
    if (!apiKey) {
      setPasswordForApiKey('copy');
    } else {
      navigator.clipboard.writeText(apiKey as string);
      setApiKeyCopied(true);
      if (apiKeyCopiedTimer) {
        clearTimeout(apiKeyCopiedTimer);
      }
      setApiKeyCopiedTimer(
        setTimeout(() => {
          setApiKeyCopied(false);
        }, 3000),
      );
    }
  };

  const handleApiKeyReveal = () => {
    setApiKeyRefreshSuccess(false);
    setApiKeyError(null);
    setApiKeyPasswordError(null);
    if (apiKey === null) {
      setPasswordForApiKey('reveal');
    } else {
      setApiKeyRevealed(true);
    }
  };

  const handleApiKeyHide = () => {
    setApiKeyRevealed(false);
  };

  const handleApiKeyRefresh = () => {
    setApiKeyRefreshSuccess(false);
    setApiKeyError(null);
    setApiKeyPasswordError(null);
    setPasswordForApiKey('refresh');
  };

  const handlePasswordForApiKeySubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    // validation
    if (!data.get('password')) {
      setApiKeyPasswordError('This field may not be blank');
      return;
    }

    // send request
    const request = {
      password: data.get('password') as string,
    };

    if (passwordForApiKey === 'reveal') {
      accountApiKeyRevealClient.sendRequest(postAccountApiKeyReveal(request));
    } else if (passwordForApiKey === 'refresh') {
      accountApiKeyRefreshClient.sendRequest(postAccountApiKeyRefresh(request));
    } else if (passwordForApiKey === 'copy') {
      accountApiKeyRevealClient.sendRequest(postAccountApiKeyReveal(request));
      setIsApiKeyCopying(true);
    }

    setPasswordForApiKey(null);
  };

  React.useEffect(() => {
    accountClient.sendRequest();
  }, []);

  const changePasswordPanel = (
    <>
      <Box component="form" onSubmit={handlePasswordChangeSubmit}>
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
      <Collapse in={passwordChangeSuccess}>
        <Alert
          severity="success"
          onClose={handlePasswordChangeSuccessClose}
          sx={{ mt: 2 }}
        >
          Password changed successfully!
        </Alert>
      </Collapse>
    </>
  );

  const apiKeyPanel = (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" gap={1}>
        <OutlinedInput
          value={apiKeyRevealed ? apiKey : '●'.repeat(32)}
          size="small"
          readOnly
          disabled={!apiKeyRevealed}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="outlined"
          onClick={apiKeyRevealed ? handleApiKeyHide : handleApiKeyReveal}
          startIcon={
            apiKeyRevealed ? <VisibilityOffIcon /> : <VisibilityIcon />
          }
        >
          {apiKeyRevealed ? 'Hide' : 'Reveal'}
        </Button>
        <Button
          variant="outlined"
          onClick={handleApiKeyCopy}
          startIcon={
            apiKeyCopied ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />
          }
          color={apiKeyCopied ? 'success' : 'primary'}
        >
          {apiKeyCopied ? 'Copied' : 'Copy'}
        </Button>
      </Box>
      <Button
        variant="outlined"
        onClick={handleApiKeyRefresh}
        startIcon={<RefreshIcon />}
        sx={{ mt: 2 }}
      >
        Refresh API Key
      </Button>
      <Collapse in={apiKeyError !== null}>
        <Alert
          severity="error"
          onClose={() => setApiKeyError(null)}
          sx={{ mt: 2 }}
        >
          {apiKeyError}
        </Alert>
      </Collapse>
      <Collapse in={apiKeyRefreshSuccess}>
        <Alert
          severity="success"
          onClose={() => setApiKeyRefreshSuccess(false)}
          sx={{ mt: 2 }}
        >
          API Key refreshed successfully!
        </Alert>
      </Collapse>
    </Box>
  );

  const passwordForApiKeyDialog = (
    <Dialog
      open={passwordForApiKey !== null}
      onClose={() => setPasswordForApiKey(null)}
    >
      <DialogTitle>Enter Password</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handlePasswordForApiKeySubmit}>
          <TextField
            margin="normal"
            fullWidth
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            error={!!apiKeyPasswordError}
            helperText={apiKeyPasswordError}
            sx={{ width: '300px' }}
          />
          <Box display="flex" flexDirection="row" gap={1} mt={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setPasswordForApiKey(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Confirm
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%">
      <Panel title={account.name}>
        <Box display="flex" flexDirection="row">
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
          <Box>
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
          <Collapse in={changingPassword}>{changePasswordPanel}</Collapse>
        </Box>
      </Panel>
      <Panel title="API Key">
        <Box display="flex" flexDirection="column">
          <Box>{apiKeyPanel}</Box>
        </Box>
      </Panel>
      {passwordForApiKeyDialog}
    </Box>
  );
}

export default Account;
