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
import Pipeline from '../models/Pipeline';
import ComponentInstance from '../models/ComponentInstance';
import Component from '../models/Component';
import ComponentBrowser from './ComponentBrowser';
import ComponentDescription from './ComponentDescription';

export interface InspectPipelineRef {
  getPipelineName: () => string;
}

export interface InspectPipelineProps {
  pipeline: Pipeline;
  components: ComponentInstance[];
  setComponents: (components: ComponentInstance[]) => void;
  component: ComponentInstance | null;
  setComponent: (component: ComponentInstance | null) => void;
  setMode: (mode: 'code' | 'attr' | null) => void;
  onUnsave: () => void;
}

const InspectPipeline = React.forwardRef(
  (
    {
      pipeline,
      components,
      setComponents,
      component,
      setComponent,
      setMode,
      onUnsave,
    }: InspectPipelineProps,
    ref,
  ) => {
    const [pipelineName, setPipelineName] = React.useState(pipeline.name);
    const [addComponentDialog, setAddComponentDialog] = React.useState(false);
    const [addComponent, setAddComponent] = React.useState<Component | null>(
      null,
    );

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPipelineName(e.target.value);
      onUnsave();
    };

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

    const handleAddComponent = () => {
      setAddComponentDialog(false);
      setAddComponent(null);

      // TODO: add component
      console.log('TODO: add component');

      // duplicate component to become a component instance for now
      const newComp = {
        ...addComponent,
        id: components.length,
        order: components.length,
        isEnabled: true,
        createdAt: new Date(),
      } as ComponentInstance;

      setComponents([...components, newComp]);
    };

    const handleAddComponentSelect = (id: number) => {
      // TODO: get component from backend with id
      console.log('TODO: get component from backend');
      const i = components.length;
      setAddComponent({
        id,
        name: `Component ${i}`,
        functionName: `comp_${i}`,
        description: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `This is component ${i}`,
                },
              ],
            },
          ],
        },
        code: `def comp_${i}(user_message, data):\n  return data\n`,
        state: { [`State ${i}`]: Math.random(), Greet: 'Hi' },
        isTemplate: Math.random() < 0.5,
        createdAt: new Date(),
      } as Component);
    };

    React.useImperativeHandle(
      ref,
      () =>
        ({
          getPipelineName: () => pipelineName,
        }) as InspectPipelineRef,
    );

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
          <Typography variant="body2">Owner: {pipeline.user}</Typography>
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
                  setComponents={setComponents}
                  component={component}
                  setComponent={setComponent}
                  setMode={setMode}
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
                  <ComponentDescription component={addComponent} />
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
