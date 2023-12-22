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
import {
  ComponentInstance,
  deleteComponentInstanceDelete,
} from '../models/ComponentInstance';
import Panel from './Panel';
import useComposerAxios from '../hooks/useComposerAxios';

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const renderItem =
  (
    components: ComponentInstance[],
    component: ComponentInstance | null,
    onComponentSelect: (id: number) => void,
    onComponentEnableToggle: (id: number) => void,
    onComponentDelete: (id: number) => void,
  ) =>
  (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric,
  ) => {
    const theme = useTheme();
    const [deleteDialog, setDeleteDialog] = React.useState(false);
    const thisComponent = components[rubric.source.index];

    const componentInstanceDeleteClient = useComposerAxios();

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

    const handleComponentSelect = () => {
      onComponentSelect(thisComponent.id);
    };

    const handleComponentDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      componentInstanceDeleteClient.sendRequest(
        deleteComponentInstanceDelete(thisComponent.id),
      );
    };

    React.useEffect(() => {
      if (!componentInstanceDeleteClient.response) return;

      onComponentDelete(thisComponent.id);
      handleDialogClose();
    }, [componentInstanceDeleteClient.response]);

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onComponentEnableToggle(thisComponent.id);
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
            onClick={handleComponentSelect}
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
              color: thisComponent.is_enabled
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
              <Tooltip title={thisComponent.is_enabled ? 'Disable' : 'Enable'}>
                <Checkbox
                  edge="start"
                  size="small"
                  checked={thisComponent.is_enabled}
                  onChange={handleCheckbox}
                  onMouseDown={handleMouseDownStopPropagation}
                />
              </Tooltip>
              <Box width={8} />
              <ListItemText
                primary={`${thisComponent.name} (${thisComponent.function_name})`}
                sx={{ textAlign: 'left' }}
              />
              <Box flexGrow={1} />
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
  component: ComponentInstance | null;
  onComponentSelect: (id: number | null) => void;
  onComponentEnableToggle: (id: number) => void;
  onComponentDelete: (id: number) => void;
  index: number;
}

function ComponentItem({
  components,
  component,
  onComponentSelect,
  onComponentEnableToggle,
  onComponentDelete,
  index,
}: ComponentItemProps) {
  const thisComponent = components[index];
  return (
    <Draggable draggableId={`${thisComponent.order}`} index={index}>
      {renderItem(
        components,
        component,
        onComponentSelect,
        onComponentEnableToggle,
        onComponentDelete,
      )}
    </Draggable>
  );
}

export interface ComponentListRef {
  getComponents: () => ComponentInstance[];
}

export interface ComponentListProps {
  components: ComponentInstance[];
  component: ComponentInstance | null;
  onComponentsChange: (components: ComponentInstance[]) => void;
  onComponentSelect: (id: number | null) => void;
  onComponentEnableToggle: (id: number) => void;
  onComponentDelete: (id: number) => void;
}

const ComponentList = React.forwardRef(
  (
    {
      components,
      component,
      onComponentsChange,
      onComponentSelect,
      onComponentEnableToggle,
      onComponentDelete,
    }: ComponentListProps,
    ref: React.Ref<ComponentListRef>,
  ) => {
    const [componentList, setComponentList] =
      React.useState<ComponentInstance[]>(components);

    const handleComponentsChange = (result: DropResult) => {
      if (!result.destination) {
        return;
      }

      if (result.destination.index === result.source.index) {
        return;
      }

      let newComps = reorder(
        components,
        result.source.index,
        result.destination.index,
      );

      newComps = newComps.map((comp: ComponentInstance, index: number) => ({
        ...comp,
        order: index,
      }));

      setComponentList(newComps);
      onComponentsChange(newComps);
    };

    const handleComponentSelect = (id: number | null) => {
      onComponentSelect(id);
    };

    const handleComponentEnableToggle = (id: number) => {
      setComponentList(
        componentList.map((comp: ComponentInstance) => {
          if (comp.id === id) {
            return {
              ...comp,
              is_enabled: !comp.is_enabled,
            };
          }

          return comp;
        }),
      );
      onComponentEnableToggle(id);
    };

    const handleComponentDelete = (id: number) => {
      setComponentList(
        componentList.filter((comp: ComponentInstance) => comp.id !== id),
      );
      onComponentDelete(id);
    };

    // effects

    React.useEffect(() => {
      setComponentList(components);
    }, [components]);

    // imperative

    React.useImperativeHandle(ref, () => ({
      getComponents: () => componentList,
    }));

    return (
      <DragDropContext onDragEnd={handleComponentsChange}>
        <Droppable
          droppableId="droppable"
          renderClone={React.useMemo(
            () =>
              renderItem(
                components,
                component,
                handleComponentSelect,
                handleComponentEnableToggle,
                handleComponentDelete,
              ),
            [components, component],
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
                  component={component}
                  onComponentSelect={handleComponentSelect}
                  onComponentEnableToggle={handleComponentEnableToggle}
                  onComponentDelete={handleComponentDelete}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    );
  },
);

export default ComponentList;
