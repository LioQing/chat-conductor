import React from 'react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  Droppable,
  DraggableStateSnapshot,
  DraggableRubric,
} from '@hello-pangea/dnd';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import CodeIcon from '@mui/icons-material/Code';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material';
import ComponentInstance from '../models/ComponentInstance';
import Panel from './Panel';

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const renderItem =
  (
    components: ComponentInstance[],
    setComponents: (components: ComponentInstance[]) => void,
    component: ComponentInstance | null,
    setComponent: (component: ComponentInstance) => void,
    setMode: (mode: 'code' | 'attr' | null) => void,
  ) =>
  (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric,
  ) => {
    const theme = useTheme();
    const [deleteDialog, setDeleteDialog] = React.useState(false);
    const thisComponent = components[rubric.source.index];

    const handleMouseDownStopPropagation = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    const handleDialogClose = () => {
      setDeleteDialog(false);
    };

    const handleComponentDeleteDialog = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDeleteDialog(true);
    };

    const handleComponentAttributes = () => {
      setComponent(thisComponent);
      setMode('attr');
    };

    const handleComponentDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      // TODO: Delete from backend
      console.log('TODO: Delete from backend', component);
      const newComps = components.filter(
        (comp: ComponentInstance) => comp.id !== thisComponent.id,
      );
      setComponents(newComps);

      if (component?.id === thisComponent.id) {
        setMode(null);
      }
    };

    const handleComponentSelect = (e: React.MouseEvent) => {
      e.stopPropagation();
      setComponent(thisComponent);
      setMode('code');
    };

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const newComps = components.map((comp: ComponentInstance) => {
        if (comp.id === thisComponent.id) {
          return {
            ...comp,
            isEnabled: e.target.checked,
          };
        }

        return comp;
      });

      setComponents(newComps);
    };

    return (
      <ListItem
        ref={provided.innerRef}
        {...provided.draggableProps}
        sx={{
          ...provided.draggableProps.style,
          py: 0.5,
          px: 0,
        }}
      >
        <Panel
          elevation={snapshot.isDragging ? 4 : 2}
          sx={{
            p: 0,
            pt: 0,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <ButtonBase
            component="div"
            onClick={handleComponentAttributes}
            sx={{
              py: 1,
              px: 2,
              width: '100%',
              backgroundColor:
                component?.id === thisComponent.id
                  ? alpha(
                      theme.palette.primary.main,
                      theme.palette.action.selectedOpacity,
                    )
                  : 'transparent',
              color: thisComponent.isEnabled
                ? undefined
                : theme.palette.text.disabled,
              transition: theme.transitions.create('all', {
                duration: theme.transitions.duration.short,
              }),
              '&:hover': {
                backgroundColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.action.hoverOpacity,
                ),
              },
            }}
          >
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
              width="100%"
            >
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                {...provided.dragHandleProps}
                onMouseOver={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <DragIndicatorIcon color="primary" />
              </Box>
              <Box width={8} />
              <Tooltip title={thisComponent.isEnabled ? 'Disable' : 'Enable'}>
                <Checkbox
                  edge="start"
                  size="small"
                  checked={thisComponent.isEnabled}
                  onChange={handleCheckbox}
                  onMouseDown={handleMouseDownStopPropagation}
                />
              </Tooltip>
              <Box width={8} />
              <ListItemText
                primary={thisComponent.name}
                sx={{ textAlign: 'left' }}
              />
              <Box flexGrow={1} />
              <Tooltip title="Code">
                <IconButton
                  edge="end"
                  size="small"
                  onClick={handleComponentSelect}
                  onMouseDown={handleMouseDownStopPropagation}
                >
                  <CodeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Box width={8} />
              <Tooltip title="Delete">
                <IconButton
                  edge="end"
                  size="small"
                  onClick={handleComponentDeleteDialog}
                  onMouseDown={handleMouseDownStopPropagation}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ButtonBase>
        </Panel>
        <Dialog open={deleteDialog} onClose={handleDialogClose}>
          <DialogTitle>Delete Component</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete component{' '}
              <b>
                {thisComponent.name} (ID: {thisComponent.id})
              </b>
              ? This action cannot be undone.
            </DialogContentText>
            <Box display="flex" justifyContent="center" gap={1} mt={1}>
              <Button variant="outlined" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleComponentDelete}
              >
                Delete
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </ListItem>
    );
  };

interface ComponentItemProps {
  components: ComponentInstance[];
  setComponents: (components: ComponentInstance[]) => void;
  component: ComponentInstance | null;
  setComponent: (component: ComponentInstance) => void;
  setMode: (mode: 'code' | 'attr' | null) => void;
  index: number;
}

function ComponentItem({
  components,
  setComponents,
  component,
  setComponent,
  setMode,
  index,
}: ComponentItemProps) {
  const thisComponent = components[index];
  return (
    <Draggable draggableId={`${thisComponent.order}`} index={index}>
      {renderItem(components, setComponents, component, setComponent, setMode)}
    </Draggable>
  );
}

export interface ComponentListProps {
  components: ComponentInstance[];
  setComponents: (components: ComponentInstance[]) => void;
  component: ComponentInstance | null;
  setComponent: (component: ComponentInstance | null) => void;
  setMode: (mode: 'code' | 'attr' | null) => void;
}

function ComponentList({
  components,
  setComponents,
  component,
  setComponent,
  setMode,
}: ComponentListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const newComps = reorder(
      components,
      result.source.index,
      result.destination.index,
    );

    setComponents(newComps);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId="droppable"
        renderClone={React.useMemo(
          () =>
            renderItem(
              components,
              setComponents,
              component,
              setComponent,
              setMode,
            ),
          [components, setComponents, setComponent, setMode],
        )}
      >
        {(provided: DroppableProvided) => (
          <List
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ transform: 'none' }}
          >
            {components.map((c: ComponentInstance, index: number) => (
              <ComponentItem
                key={c.order}
                components={components}
                setComponents={setComponents}
                component={component}
                setComponent={setComponent}
                setMode={setMode}
                index={index}
              />
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default ComponentList;
