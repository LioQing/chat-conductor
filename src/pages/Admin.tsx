import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Panel from '../components/Panel';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  AdminCreateUser,
  AdminCreateUserRequest,
  postAdminCreateUser,
} from '../models/AdminCreateUser';
import {
  AdminWhitelist,
  AdminWhitelistRequest,
  patchAdminWhitelist,
} from '../models/AdminWhitelist';
import {
  AdminMakeTemplate,
  AdminMakeTemplateRequest,
  patchAdminMakeTemplate,
} from '../models/AdminMakeTemplate';

function Admin() {
  const [usernameError, setUsernameError] = React.useState<string | null>(null);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [whitelistError, setWhitelistError] = React.useState<string | null>(
    null,
  );
  const [idError, setIdError] = React.useState<string | null>(null);
  const [createUserPassword, setCreateUserPassword] = React.useState<
    string | null
  >(null);
  const [whitelistSuccessful, setWhitelistSuccessful] = React.useState(false);
  const [makeTemplateSuccessful, setMakeTemplateSuccessful] =
    React.useState(false);
  const [templateComponentId, setTemplateComponentId] = React.useState<
    number | null
  >(null);

  const createUserClient = useComposerAxios<
    AdminCreateUser,
    AdminCreateUserRequest
  >();
  const whitelistClient = useComposerAxios<
    AdminWhitelist,
    AdminWhitelistRequest
  >();
  const makeTemplateClient = useComposerAxios<
    AdminMakeTemplate,
    AdminMakeTemplateRequest
  >();

  const handleCreateUserSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateUserPassword(null);
    const data = new FormData(event.currentTarget);

    // validation
    setUsernameError(null);
    setNameError(null);
    setEmailError(null);

    if (!data.get('username')) {
      setUsernameError('This field may not be blank');
      return;
    }

    if (!data.get('name')) {
      setNameError('This field may not be blank');
      return;
    }

    if (!data.get('email')) {
      setEmailError('This field may not be blank');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(data.get('email') as string)) {
      setEmailError('Invalid email format');
      return;
    }

    createUserClient.sendRequest(
      postAdminCreateUser({
        username: data.get('username') as string,
        name: data.get('name') as string,
        email: data.get('email') as string,
      } as AdminCreateUserRequest),
    );
  };

  React.useEffect(() => {
    if (!createUserClient.response) {
      return;
    }

    if (createUserClient.response.status === 201) {
      setCreateUserPassword(createUserClient.response.data.password);
    }
  }, [createUserClient.response]);

  React.useEffect(() => {
    if (!createUserClient.error) {
      return;
    }

    console.log(createUserClient.error);
  }, [createUserClient.error]);

  React.useEffect(() => {
    if (!createUserClient.error) {
      return;
    }

    const error = createUserClient.error.response?.data as any;

    if (createUserClient.error.response?.status === 400) {
      if (error.username) {
        setUsernameError(error.username[0]);
      }

      if (error.name) {
        setNameError(error.name[0]);
      }

      if (error.email) {
        setEmailError(error.email[0]);
      }
    }
  }, [createUserClient.error]);

  const handleWhitelistUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    // validation
    setWhitelistError(null);

    if (!data.get('id')) {
      setWhitelistError('This field may not be blank');
      return;
    }

    whitelistClient.sendRequest(
      patchAdminWhitelist({
        username: data.get('id') as string,
        whitelist: (event.nativeEvent as any).submitter.name === 'whitelist',
      } as AdminWhitelistRequest),
    );
  };

  React.useEffect(() => {
    if (!whitelistClient.response) {
      return;
    }

    if (whitelistClient.response.status === 200) {
      setWhitelistSuccessful(true);
    }
  }, [whitelistClient.response]);

  React.useEffect(() => {
    if (!whitelistClient.error) {
      return;
    }

    setWhitelistError(whitelistClient.error.message);
  }, [whitelistClient.error]);

  const handleMakeTemplateSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    // validation
    setIdError(null);

    if (!data.get('id')) {
      setIdError('This field may not be blank');
      return;
    }

    setTemplateComponentId(Number(data.get('id')));

    makeTemplateClient.sendRequest(
      patchAdminMakeTemplate(Number(data.get('id')), {
        is_template: (event.nativeEvent as any).submitter.name === 'make',
      } as AdminMakeTemplateRequest),
    );
  };

  React.useEffect(() => {
    if (!makeTemplateClient.response) {
      return;
    }

    if (makeTemplateClient.response.status === 200) {
      setMakeTemplateSuccessful(true);
    }
  }, [makeTemplateClient.response]);

  React.useEffect(() => {
    if (!makeTemplateClient.error) {
      return;
    }

    setIdError(makeTemplateClient.error.message);
  }, [makeTemplateClient.error]);

  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%">
      <Panel title="Create New User">
        <Box component="form" onSubmit={handleCreateUserSubmit}>
          <TextField
            margin="normal"
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="new-password"
            error={!!usernameError}
            helperText={usernameError}
          />
          <TextField
            margin="normal"
            fullWidth
            id="name"
            label="Name"
            name="name"
            autoComplete="new-password"
            error={!!nameError}
            helperText={nameError}
          />
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="new-password"
            error={!!emailError}
            helperText={emailError}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
        {createUserPassword && (
          <Box mt={2} ml={1}>
            <Typography variant="h6">Successfully Created User</Typography>
            <Typography variant="body1">
              Username: {createUserClient.response?.data.username}
            </Typography>
            <Typography variant="body1">
              Password: {createUserPassword}
            </Typography>
          </Box>
        )}
      </Panel>
      <Panel title="Whitelist User">
        <Box component="form" onSubmit={handleWhitelistUser}>
          <TextField
            margin="normal"
            fullWidth
            id="id"
            label="Username"
            name="id"
            autoComplete="new-password"
            error={!!whitelistError}
            helperText={whitelistError}
          />
          <Box display="flex" flexDirection="row" gap={1}>
            <Button
              type="submit"
              name="whitelist"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Whitelist
            </Button>
            <Button
              type="submit"
              name="undo"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Undo Whitelist
            </Button>
          </Box>
        </Box>
        {whitelistSuccessful && (
          <Box mt={2} ml={1}>
            <Typography variant="h6">
              Successfully{' '}
              {whitelistClient.response?.data.whitelist
                ? 'Whitelisted'
                : 'Undone Whitelist'}{' '}
              User
            </Typography>
            <Typography variant="body1">
              Username: {whitelistClient.response?.data.username}
            </Typography>
          </Box>
        )}
      </Panel>
      <Panel title="Set Component as Template">
        <Box component="form" onSubmit={handleMakeTemplateSubmit}>
          <TextField
            margin="normal"
            fullWidth
            id="id"
            label="Component ID"
            name="id"
            type="number"
            autoComplete="new-password"
            error={!!idError}
            helperText={idError}
          />
          <Box display="flex" flexDirection="row" gap={1}>
            <Button
              type="submit"
              name="make"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Make Template
            </Button>
            <Button
              type="submit"
              name="undo"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Undo Make Template
            </Button>
          </Box>
        </Box>
        {makeTemplateSuccessful && (
          <Box mt={2} ml={1}>
            <Typography variant="h6">
              Successfully{' '}
              {makeTemplateClient.response?.data.is_template
                ? 'Made'
                : 'Undone Make'}{' '}
              Component as Template
            </Typography>
            <Typography variant="body1">
              Component ID: {templateComponentId}
            </Typography>
          </Box>
        )}
      </Panel>
    </Box>
  );
}

export default Admin;
