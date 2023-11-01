import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import OutlinedInput from '@mui/material/OutlinedInput';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
  DropResult,
  Droppable,
  DroppableProvided,
} from '@hello-pangea/dnd';
import {
  JsonValue,
  isJsonObject,
  isJsonArray,
  JsonArray,
} from '../utils/JsonObject';

interface JsonTextFieldProps {
  type?: 'text' | 'number';
  value: string | number;
  onChange: (value: string) => void;
}

function JsonTextField({ type, value, onChange }: JsonTextFieldProps) {
  const [openString, setOpenString] = React.useState(false);

  const handleClickOpenString = () => {
    if (typeof value === 'string') {
      setOpenString(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenString(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <OutlinedInput
      value={value}
      onChange={handleChange}
      type={type}
      size="small"
      autoComplete="new-password" // https://learn.microsoft.com/en-us/answers/questions/974921/edge-bug-autocomplete-off-still-displays-previousl
      sx={{ width: '200px' }}
      endAdornment={
        typeof value === 'string' ? (
          <InputAdornment position="end">
            <Tooltip title="Edit in Full" placement="left">
              <IconButton
                onClick={handleClickOpenString}
                edge="end"
                size="small"
              >
                <OpenInFullIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Dialog
              open={openString}
              onClose={handleCloseDialog}
              fullWidth
              PaperProps={{ sx: { p: 1 } }}
            >
              <OutlinedInput
                value={value}
                onChange={handleChange}
                multiline
                rows={10}
                autoFocus
              />
            </Dialog>
          </InputAdornment>
        ) : undefined
      }
    />
  );
}

JsonTextField.defaultProps = {
  type: 'text',
};

const renderItem =
  (
    value: JsonArray,
    onChange: (value: JsonArray, objectKeys?: string[]) => void,
    childrenObjectKeys: (string[] | null)[] | null,
    setChildrenObjectKeys: (
      childrenObjectKeys: (string[] | null)[] | null,
    ) => void,
    handleHovered: boolean[],
    setHandleHovered: (handleHovered: boolean[]) => void,
    objectKeys: string[],
    removeButton: (k: string | number) => React.ReactNode,
  ) =>
  (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric,
  ) => {
    const theme = useTheme();
    const i = rubric.source.index;
    const v = value[i];

    return (
      <Box
        display="flex"
        flexDirection="row"
        ref={provided.innerRef}
        {...provided.draggableProps}
        sx={{
          ...provided.draggableProps.style,
          backgroundColor: snapshot.isDragging
            ? alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity,
              )
            : handleHovered[i]
            ? alpha(
                theme.palette.primary.main,
                theme.palette.action.hoverOpacity,
              )
            : undefined,
          transition: theme.transitions.create('all', {
            duration: theme.transitions.duration.short,
          }),
          borderRadius: 1,
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          {...provided.dragHandleProps}
          onMouseEnter={() => {
            setHandleHovered(handleHovered.map((x, j) => (j === i ? true : x)));
          }}
          onMouseLeave={() =>
            setHandleHovered(handleHovered.map((x, j) => (j === i ? false : x)))
          }
          onMouseDown={(e) => e.stopPropagation()}
        >
          <DragIndicatorIcon color="primary" />
        </Box>
        <Box>
          {(isJsonObject(v) || isJsonArray(v)) && (
            <Typography variant="body1">
              {isJsonObject(v) ? '{' : isJsonArray(v) ? '[' : ''}
            </Typography>
          )}
          <Box display="flex" flexDirection="row" alignItems="center">
            <JsonEditor
              value={v}
              onChange={(w, childrenK) => {
                onChange(
                  value.map((x, j) => (j === i ? w : x)),
                  objectKeys,
                );
                if (childrenObjectKeys?.[i] && childrenK) {
                  setChildrenObjectKeys(
                    childrenObjectKeys?.map((x, j) =>
                      j === i ? childrenK : x,
                    ),
                  );
                }
              }}
              objectKeys={childrenObjectKeys?.[i] ?? undefined}
            />
            {!(isJsonObject(v) || isJsonArray(v)) && removeButton(i)}
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center">
            {(isJsonObject(v) || isJsonArray(v)) && (
              <>
                <Typography variant="body1">
                  {isJsonObject(v) ? '}' : isJsonArray(v) ? ']' : ''}
                </Typography>
                {removeButton(i)}
              </>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

interface JsonArrayEditorItemProps {
  value: JsonArray;
  onChange: (value: JsonArray, objectKeys?: string[]) => void;
  childrenObjectKeys: (string[] | null)[] | null;
  setChildrenObjectKeys: (
    childrenObjectKeys: (string[] | null)[] | null,
  ) => void;
  handleHovered: boolean[];
  setHandleHovered: (handleHovered: boolean[]) => void;
  objectKeys: string[];
  removeButton: (k: string | number) => React.ReactNode;
  index: number;
}

function JsonArrayEditorItem({
  value,
  onChange,
  childrenObjectKeys,
  setChildrenObjectKeys,
  handleHovered,
  setHandleHovered,
  objectKeys,
  removeButton,
  index,
}: JsonArrayEditorItemProps) {
  return (
    <Draggable draggableId={`${index}`} index={index}>
      {renderItem(
        value,
        onChange,
        childrenObjectKeys,
        setChildrenObjectKeys,
        handleHovered,
        setHandleHovered,
        objectKeys,
        removeButton,
      )}
    </Draggable>
  );
}

interface JsonArrayEditorProps {
  value: JsonArray;
  onChange: (value: JsonArray, objectKeys?: string[]) => void;
  childrenObjectKeys: (string[] | null)[] | null;
  setChildrenObjectKeys: (
    childrenObjectKeys: (string[] | null)[] | null,
  ) => void;
  objectKeys: string[];
  base: boolean;
  addButton: React.ReactNode;
  removeButton: (k: string | number) => React.ReactNode;
}

function JsonArrayEditor({
  value,
  onChange,
  childrenObjectKeys,
  setChildrenObjectKeys,
  objectKeys,
  base,
  addButton,
  removeButton,
}: JsonArrayEditorProps) {
  const [handleHovered, setHandleHovered] = React.useState(
    Array(value.length).fill(false),
  );

  React.useEffect(() => {
    setHandleHovered(Array(value.length).fill(false));
  }, [value]);

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const newValue = reorder(
      value,
      result.source.index,
      result.destination.index,
    );

    onChange(newValue, objectKeys);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId="droppable"
        renderClone={React.useMemo(
          () =>
            renderItem(
              value,
              onChange,
              childrenObjectKeys,
              setChildrenObjectKeys,
              handleHovered,
              setHandleHovered,
              objectKeys,
              removeButton,
            ),
          [value, onChange],
        )}
      >
        {(provided: DroppableProvided) => (
          <Box
            display="flex"
            flexDirection="column"
            width="fit-content"
            gap={1}
            pl={base ? 0 : 1}
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ transform: 'none' }}
          >
            {value.map((v: JsonValue, index: number) => (
              <JsonArrayEditorItem
                key={index}
                value={value}
                onChange={onChange}
                childrenObjectKeys={childrenObjectKeys}
                setChildrenObjectKeys={setChildrenObjectKeys}
                handleHovered={handleHovered}
                setHandleHovered={setHandleHovered}
                objectKeys={objectKeys}
                removeButton={removeButton}
                index={index}
              />
            ))}
            {provided.placeholder}
            {addButton}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export interface JsonEditorProps {
  value: JsonValue;
  onChange: (value: JsonValue, objectKeys?: string[]) => void;
  objectKeys?: string[];
  base?: boolean;
}

function JsonEditor({ value, onChange, objectKeys, base }: JsonEditorProps) {
  const theme = useTheme();
  const [addMenu, setAddMenu] = React.useState(false);

  const updateChildrenObjectKeys = () => {
    if (isJsonObject(value)) {
      return Object.values(value).map((v) => {
        if (!isJsonObject(v)) {
          return null;
        }
        return Object.entries(v).map(([k]) => k);
      });
    }

    if (isJsonArray(value)) {
      return value.map((v) => {
        if (!isJsonObject(v)) {
          return null;
        }
        return Object.entries(v).map(([k]) => k);
      });
    }

    return null;
  };

  const [childrenObjectKeys, setChildrenObjectKeys] = React.useState<
    (string[] | null)[] | null
  >(updateChildrenObjectKeys());

  React.useEffect(
    () => setChildrenObjectKeys(updateChildrenObjectKeys()),
    [value],
  );

  const handleChangeObjectKey = (old: string, k: string) => {
    if (!isJsonObject(value)) {
      return;
    }

    const v = value[old];
    delete value[old];
    const newV = { ...value, [k]: v };
    const newObjectKeys = objectKeys?.map((y) => (y === old ? k : y));
    onChange(newV, newObjectKeys);
  };

  const handleAdd = (v: JsonValue) => {
    if (isJsonObject(value)) {
      const key = 'Key';
      if (objectKeys?.includes(key)) {
        let i = 1;
        while (objectKeys.includes(`${key} ${i}`)) {
          i += 1;
        }
        onChange({ ...value, [`${key} ${i}`]: v }, [
          ...(objectKeys ?? []),
          `${key} ${i}`,
        ]);
      } else {
        onChange({ ...value, [key]: v }, [...(objectKeys ?? []), key]);
      }
    } else if (isJsonArray(value)) {
      onChange([...value, v], objectKeys);
    }

    setAddMenu(false);
  };

  const handleRemove = (k: string | number) => {
    if (isJsonObject(value)) {
      const newValue = { ...value };
      delete newValue[k];
      const newObjectKeys = objectKeys?.filter((x) => x !== k);
      onChange(newValue, newObjectKeys);
    } else if (isJsonArray(value)) {
      const newValue = [...value];
      newValue.splice(k as number, 1);
      onChange(newValue, objectKeys);
    }
  };

  const addButtons = (
    <>
      <Button
        variant="outlined"
        onClick={() => setAddMenu(!addMenu)}
        sx={{
          backgroundColor: addMenu
            ? alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity,
              )
            : undefined,
        }}
      >
        Add
      </Button>
      <Collapse in={addMenu}>
        <ButtonGroup orientation="vertical" variant="contained" fullWidth>
          <Button onClick={() => handleAdd('Value')}>String</Button>
          <Button onClick={() => handleAdd(0)}>Number</Button>
          <Button onClick={() => handleAdd(false)}>Boolean</Button>
          <Button onClick={() => handleAdd([])}>Array</Button>
          <Button onClick={() => handleAdd({})}>Object</Button>
          <Button onClick={() => handleAdd(null)}>Null</Button>
        </ButtonGroup>
      </Collapse>
    </>
  );

  const removeButton = (k: string | number) => (
    <Tooltip title="Remove" placement="right">
      <IconButton size="small" onClick={() => handleRemove(k)} sx={{ ml: 0.5 }}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box display="flex" flexDirection="column">
      {typeof value === 'string' ? (
        <JsonTextField
          value={value}
          onChange={(v) => onChange(v, objectKeys)}
        />
      ) : typeof value === 'number' ? (
        <JsonTextField
          type="number"
          value={value}
          onChange={(v) => onChange(Number(v), objectKeys)}
        />
      ) : typeof value === 'boolean' ? (
        <FormControlLabel
          control={
            <Checkbox
              checked={value}
              onChange={(e) => onChange(e.target.checked, objectKeys)}
            />
          }
          label={String(value)}
          sx={{ px: 1 }}
        />
      ) : isJsonObject(value) ? (
        <Box
          display="flex"
          flexDirection="column"
          width="fit-content"
          gap={1}
          pl={base ? 0 : 1}
        >
          {objectKeys?.map((k, i) => (
            <React.Fragment key={i}>
              <Box display="flex" flexDirection="row" alignItems="center">
                <JsonTextField
                  value={k}
                  onChange={(v) => handleChangeObjectKey(k, v)}
                />
                <Typography variant="body1">
                  :
                  {isJsonObject(value[k])
                    ? '{'
                    : isJsonArray(value[k])
                    ? '['
                    : ''}
                </Typography>
                {!(isJsonObject(value[k]) || isJsonArray(value[k])) && (
                  <>
                    <JsonEditor
                      value={value[k]}
                      onChange={(w, childrenK) => {
                        onChange({ ...value, [k]: w }, objectKeys);
                        if (childrenObjectKeys?.[i] && childrenK) {
                          setChildrenObjectKeys(
                            childrenObjectKeys?.map((x, j) =>
                              j === i ? childrenK : x,
                            ),
                          );
                        }
                      }}
                      objectKeys={childrenObjectKeys![i] ?? undefined}
                    />
                    {removeButton(k)}
                  </>
                )}
              </Box>
              {(isJsonObject(value[k]) || isJsonArray(value[k])) && (
                <>
                  <JsonEditor
                    value={value[k]}
                    onChange={(w, childrenK) => {
                      onChange({ ...value, [k]: w }, objectKeys);
                      if (childrenObjectKeys?.[i] && childrenK) {
                        setChildrenObjectKeys(
                          childrenObjectKeys?.map((x, j) =>
                            j === i ? childrenK : x,
                          ),
                        );
                      }
                    }}
                    objectKeys={childrenObjectKeys![i] ?? undefined}
                  />
                  <Box display="flex" flexDirection="row" alignItems="center">
                    <Typography variant="body1">
                      {isJsonObject(value[k])
                        ? '}'
                        : isJsonArray(value[k])
                        ? ']'
                        : ''}
                    </Typography>
                    {removeButton(k)}
                  </Box>
                </>
              )}
            </React.Fragment>
          ))}
          {addButtons}
        </Box>
      ) : isJsonArray(value) ? (
        <JsonArrayEditor
          value={value}
          onChange={onChange}
          childrenObjectKeys={childrenObjectKeys}
          setChildrenObjectKeys={setChildrenObjectKeys}
          objectKeys={objectKeys ?? []}
          base={base!}
          addButton={addButtons}
          removeButton={removeButton}
        />
      ) : (
        <Typography variant="body1">null</Typography>
      )}
    </Box>
  );
}

JsonEditor.defaultProps = {
  objectKeys: [],
  base: false,
};

export default JsonEditor;
