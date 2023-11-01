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
import Pipeline from '../models/Pipeline';

export interface PipelineListProps {
  setPipeline: (pipeline: Pipeline | null) => void;
}

function PipelineList({ setPipeline }: PipelineListProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuDialog, setMenuDialog] = React.useState<
    'Rename' | 'Delete' | null
  >(null);
  const [menuPipeline, setMenuPipeline] = React.useState<null | Pipeline>(null);
  // TODO: get pipelines from backend
  console.log('TODO: get pipelines from backend');
  const [pipelines, setPipelines] = React.useState([
    { id: 1, name: '_Pipeline 01', user: 'user1' } as Pipeline,
    { id: 2, name: '_Pipeline 02', user: 'user1' } as Pipeline,
    { id: 3, name: '_Pipeline 03', user: 'user1' } as Pipeline,
    { id: 4, name: '_Pipeline 04', user: 'user1' } as Pipeline,
    { id: 5, name: '_Pipeline 05', user: 'user1' } as Pipeline,
    { id: 6, name: '_Pipeline 06', user: 'user1' } as Pipeline,
    { id: 7, name: '_Pipeline 07', user: 'user1' } as Pipeline,
    { id: 8, name: '_Pipeline 08', user: 'user1' } as Pipeline,
    { id: 9, name: '_Pipeline 09', user: 'user1' } as Pipeline,
    { id: 10, name: 'Pipeline 10', user: 'user1' } as Pipeline,
    { id: 11, name: 'Pipeline 11', user: 'user1' } as Pipeline,
    { id: 12, name: 'Pipeline 12', user: 'user1' } as Pipeline,
    { id: 13, name: 'Pipeline 13', user: 'user1' } as Pipeline,
    { id: 14, name: 'Pipeline 14', user: 'user1' } as Pipeline,
    { id: 15, name: 'Pipeline 15', user: 'user1' } as Pipeline,
    { id: 16, name: 'Pipeline 16', user: 'user1' } as Pipeline,
    { id: 17, name: 'Pipeline 17', user: 'user1' } as Pipeline,
    { id: 18, name: 'Pipeline 18', user: 'user1' } as Pipeline,
    { id: 19, name: 'Pipeline 19', user: 'user1' } as Pipeline,
    { id: 20, name: 'Pipeline 20', user: 'user1' } as Pipeline,
  ]);

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

    // TODO: Rename in backend
    console.log('TODO: Rename in backend');
    const data = new FormData(event.currentTarget);
    console.log({
      name: data.get('new-name'),
    });

    handleDialogClose();
  };

  const handleDelete = () => {
    handleMenuClose();
    setMenuDialog('Delete');
  };

  const handleDeleteConfirm = () => {
    // TODO: Delete in backend
    console.log('TODO: Delete in backend', menuPipeline);
    setPipelines(pipelines.filter((p) => p.id !== menuPipeline?.id));
    handleDialogClose();
  };

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
          <Box component="form" onSubmit={handleRenameSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="new-name"
              label="New Name"
              name="new-name"
              autoFocus
            />
            <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
              <Button variant="outlined" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
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
