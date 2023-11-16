import React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ListItem from '@mui/material/ListItem';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import {
  Pipeline,
  deletePipelineDelete,
  getPipeline,
} from '../models/Pipeline';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  PipelineRename,
  PipelineRenameRequest,
  putPipelineRename,
} from '../models/PipelineRename';
import useQuery from '../hooks/useQuery';

export interface PipelineListProps {
  setPipeline: (pipeline: Pipeline | null) => void;
}

function PipelineList({ setPipeline }: PipelineListProps) {
  const query = useQuery();
  const pipelinesClient = useComposerAxios<Pipeline[]>(getPipeline());
  const pipelineDeleteClient = useComposerAxios<Pipeline[]>();
  const pipelineRenameClient = useComposerAxios<
    PipelineRename,
    PipelineRenameRequest
  >();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuDialog, setMenuDialog] = React.useState<
    'Rename' | 'Delete' | null
  >(null);
  const [menuPipeline, setMenuPipeline] = React.useState<null | Pipeline>(null);
  const [pipelines, setPipelines] = React.useState<Pipeline[]>([]);

  const fetchPipelines = () => {
    pipelinesClient.sendRequest();
  };

  React.useEffect(() => {
    fetchPipelines();
  }, []);

  React.useEffect(() => {
    if (!pipelinesClient.response) return;

    setPipelines(pipelinesClient.response.data);

    if (query.has('pipeline')) {
      const pipelineIdParam = query.get('pipeline');
      if (!pipelineIdParam) return;

      const pipelineId = parseInt(pipelineIdParam, 10);
      if (Number.isNaN(pipelineId)) return;

      const pipeline = pipelines.find((p) => p.id === pipelineId);
      if (!pipeline) return;

      setPipeline(pipeline);
    }
  }, [pipelinesClient.response]);

  const handleSelectPipeline = (pipeline: Pipeline) => {
    setPipeline(pipeline);
  };

  const handleMenu =
    (pipeline: Pipeline) => (event: React.MouseEvent<HTMLElement>) => {
      setMenuPipeline(pipeline);
      setAnchorEl(event.currentTarget);
    };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogClose = () => {
    setMenuDialog(null);
  };

  const handleRename = () => {
    handleMenuClose();
    setMenuDialog('Rename');
  };

  const handleRenameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!menuPipeline) return;

    const data = new FormData(event.currentTarget);
    const newName = data.get('new-name');
    if (!newName) return;

    pipelineRenameClient.sendRequest(
      putPipelineRename(menuPipeline.id, { name: newName as string }),
    );
  };

  React.useEffect(() => {
    if (!pipelineRenameClient.response) return;

    handleDialogClose();
    fetchPipelines();
  }, [pipelineRenameClient.response]);

  const handleDelete = () => {
    handleMenuClose();
    setMenuDialog('Delete');
  };

  const handleDeleteConfirm = () => {
    if (!menuPipeline) return;
    pipelineDeleteClient.sendRequest(deletePipelineDelete(menuPipeline.id));
  };

  React.useEffect(() => {
    if (pipelineDeleteClient.response === null) return;

    handleDialogClose();
    fetchPipelines();
  }, [pipelineDeleteClient.response]);

  return (
    <List>
      <Divider />
      {pipelines.map((p) => (
        <ListItem
          key={p.id}
          divider
          disablePadding
          secondaryAction={
            <Box pr={1}>
              <Tooltip title="More">
                <IconButton edge="end" onClick={handleMenu(p)}>
                  <MoreHorizIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <ListItemButton
            onClick={() => handleSelectPipeline(p)}
            sx={{ pl: 3 }}
          >
            <ListItemText primary={p.name} secondary={`ID: ${p.id}`} />
          </ListItemButton>
        </ListItem>
      ))}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRename}>Rename</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
      <Dialog open={menuDialog === 'Rename'} onClose={handleDialogClose}>
        <DialogTitle>Rename Pipeline</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new name for the pipeline{' '}
            <b>
              {menuPipeline?.name} (ID: {menuPipeline?.id})
            </b>
            .
          </DialogContentText>
          <Box id="rename-form" component="form" onSubmit={handleRenameSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="new-name"
              label="New Name"
              name="new-name"
              autoComplete="new-password" // https://learn.microsoft.com/en-us/answers/questions/974921/edge-bug-autocomplete-off-still-displays-previousl
              autoFocus
            />
            <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
              <Button
                type="button"
                variant="outlined"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button
                sx={{ form: 'rename-form' }}
                type="submit"
                variant="contained"
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={menuDialog === 'Delete'} onClose={handleDialogClose}>
        <DialogTitle>Delete Pipeline</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <b>
              {menuPipeline?.name} (ID: {menuPipeline?.id})
            </b>
            ?
          </DialogContentText>
          <Box display="flex" justifyContent="center" gap={1} mt={1}>
            <Button variant="outlined" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </List>
  );
}

export default PipelineList;
