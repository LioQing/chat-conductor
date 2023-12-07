import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ComponentList from './ComponentList';
import { Pipeline } from '../models/Pipeline';
import { ComponentInstance } from '../models/ComponentInstance';
import { Component, getComponent } from '../models/Component';
import ComponentBrowser from './ComponentBrowser';
import ComponentDetails from './ComponentDetails';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  ComponentInstanceNew,
  ComponentInstanceNewRequest,
  postComponentInstanceNew,
} from '../models/ComponentInstanceNew';

export interface InspectPipelineRef {
  getPipeline: () => Pipeline;
  getComponents: () => ComponentInstance[];
}

export interface InspectPipelineProps {
  pipeline: Pipeline;
  components: ComponentInstance[];
  component: ComponentInstance | null;
  onPipelineChange: (pipeline: Pipeline) => void;
  onComponentsChange: (component: ComponentInstance[]) => void;
  onComponentSelect: (id: number | null) => void;
  onComponentEnableToggle: (id: number) => void;
  onComponentNew: (component: ComponentInstance) => void;
  onComponentDelete: (id: number) => void;
}

const InspectPipeline = React.forwardRef(
  (
    {
      pipeline,
      components,
      component,
      onPipelineChange,
      onComponentsChange,
      onComponentSelect,
      onComponentEnableToggle,
      onComponentNew,
      onComponentDelete,
    }: InspectPipelineProps,
    ref,
  ) => {
    // add component dialogs

    const [addComponentDialog, setAddComponentDialog] = React.useState(false);
    const addComponentSelectClient = useComposerAxios<Component>();

    const handleAddComponentSelect = (id: number) => {
      addComponentSelectClient.sendRequest(getComponent(id));
    };

    React.useEffect(() => {
      if (!addComponentSelectClient.response) return;

      setAddComponent(addComponentSelectClient.response.data);
    }, [addComponentSelectClient.response]);

    const [addComponent, setAddComponent] = React.useState<Component | null>(
      null,
    );
    const addComponentClient = useComposerAxios<
      ComponentInstanceNew,
      ComponentInstanceNewRequest
    >();

    const handleAddComponent = () => {
      setAddComponentDialog(false);
      setAddComponent(null);

      if (!addComponent) return;

      addComponentClient.sendRequest(
        postComponentInstanceNew(pipeline.id, {
          template_component_id: addComponent.id,
        }),
      );
    };

    React.useEffect(() => {
      if (!addComponentClient.response) return;

      const component = addComponentClient.response.data;
      onComponentNew(component);
    }, [addComponentClient.response]);

    const handleAddComponentDialogOpen = () => {
      setAddComponentDialog(true);
      setAddComponent(null);
    };

    const handleAddComponentDialogClose = () => {
      if (addComponent) {
        setAddComponent(null);
        return;
      }
      setAddComponentDialog(false);
    };

    // edits

    const [pipelineName, setPipelineName] = React.useState(pipeline.name);

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPipelineName(e.target.value);
      onPipelineChange({ ...pipeline, name: e.target.value });
    };

    const handlePipelineAttributesSelect = () => {
      onComponentSelect(null);
    };

    // effects

    React.useEffect(() => {
      if (!pipeline) return;

      setPipelineName(pipeline.name);
    }, [pipeline]);

    // imperative

    React.useImperativeHandle(ref, () => ({
      getPipeline: () => ({
        ...pipeline,
        name: pipelineName,
      }),
      getComponents: () => components,
    }));

    return (
      <Box display="flex" flexDirection="column" gap={1} minHeight={0}>
        <Box px={3}>
          <TextField
            value={pipelineName}
            onChange={handleChangeName}
            label="Name"
            size="small"
            variant="standard"
            autoComplete="new-password" // https://learn.microsoft.com/en-us/answers/questions/974921/edge-bug-autocomplete-off-still-displays-previousl
            sx={{ my: 1 }}
          />
          <Typography variant="body2">Pipeline ID: {pipeline.id}</Typography>
          <Typography variant="body2">
            Created At: {new Date(pipeline.created_at).toLocaleString()}
          </Typography>
          <Button
            variant="outlined"
            onClick={handlePipelineAttributesSelect}
            sx={{
              width: '100%',
              my: 1,
            }}
          >
            Attributes
          </Button>
        </Box>
        <Divider sx={{ mx: 3 }} />
        {React.useMemo(
          () => (
            <Box display="flex" flexDirection="column" minHeight={0}>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                px={3}
              >
                <Typography variant="h6">Components</Typography>
                <Box flexGrow={1} />
                <Tooltip title="Add component">
                  <IconButton edge="end" onClick={handleAddComponentDialogOpen}>
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box overflow="auto" pl={3} pr={2}>
                <ComponentList
                  components={components}
                  component={component}
                  onComponentsChange={onComponentsChange}
                  onComponentSelect={onComponentSelect}
                  onComponentEnableToggle={onComponentEnableToggle}
                  onComponentDelete={onComponentDelete}
                />
              </Box>
            </Box>
          ),
          [components, component],
        )}
        {React.useMemo(
          () => (
            <Dialog
              open={addComponentDialog}
              onClose={handleAddComponentDialogClose}
              maxWidth="lg"
              fullWidth
              PaperProps={{ sx: { height: '80vh' } }}
            >
              <DialogTitle>Add Component</DialogTitle>
              <DialogContent>
                {addComponent ? (
                  <ComponentDetails component={addComponent} />
                ) : (
                  <ComponentBrowser onSelectId={handleAddComponentSelect} />
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleAddComponentDialogClose}>
                  {addComponent ? 'Back' : 'Cancel'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddComponent}
                  disabled={!addComponent}
                >
                  Add
                </Button>
              </DialogActions>
            </Dialog>
          ),
          [addComponentDialog, addComponent],
        )}
      </Box>
    );
  },
);

export default InspectPipeline;
