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
import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
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

export enum JsonChangeType {
  Add = 'add',
  Remove = 'remove',
  Edit = 'edit',
  Reorder = 'reorder',
  Key = 'key',
}

export interface JsonChange {
  type: JsonChangeType;
  accessor: (string | number)[];
}

// only on object or array
export interface JsonAddChange extends JsonChange {
  type: JsonChangeType.Add;
  key?: string;
  value: JsonValue;
}

// only on object or array
export interface JsonRemoveChange extends JsonChange {
  type: JsonChangeType.Remove;
  key: string | number;
}

// only on string, number, boolean
export interface JsonEditChange extends JsonChange {
  type: JsonChangeType.Edit;
  value: string | number | boolean;
}

// only on array
export interface JsonReorderChange extends JsonChange {
  type: JsonChangeType.Reorder;
  from: number;
  to: number;
}

// only on object
export interface JsonKeyChange extends JsonChange {
  type: JsonChangeType.Key;
  from: string;
  to: string;
}

export interface JsonChoice {
  name: string;
  default: JsonValue;
}

export const DefaultJsonChoices: { [key: string]: JsonChoice } = {
  string: { name: 'String', default: 'Value' },
  number: { name: 'Number', default: 0 },
  boolean: { name: 'Boolean', default: false },
  array: { name: 'Array', default: [] },
  object: { name: 'Object', default: {} },
  null: { name: 'Null', default: null },
};

export interface JsonTextFieldProps {
  type?: 'text' | 'number';
  value: string | number;
  onChange: (value: string, change: JsonChange) => void;
  inputProps?: OutlinedInputProps;
  disabled?: boolean;
}

export function JsonTextField({
  type,
  value,
  onChange,
  inputProps,
  disabled,
}: JsonTextFieldProps) {
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
    onChange(e.target.value, {
      type: JsonChangeType.Edit,
      accessor: [],
      value: e.target.value,
    } as JsonEditChange);
  };

  return (
    <OutlinedInput
      value={value}
      onChange={handleChange}
      type={type}
      size="small"
      autoComplete="new-password" // https://learn.microsoft.com/en-us/answers/questions/974921/edge-bug-autocomplete-off-still-displays-previousl
      disabled={disabled}
      sx={{ width: '200px' }}
      endAdornment={
        typeof value === 'string' ? (
          <InputAdornment position="end">
            {disabled ? (
              <IconButton
                onClick={handleClickOpenString}
                edge="end"
                size="small"
                disabled
              >
                <OpenInFullIcon fontSize="small" />
              </IconButton>
            ) : (
              <Tooltip title="Edit in Full" placement="left">
                <IconButton
                  onClick={handleClickOpenString}
                  edge="end"
                  size="small"
                >
                  <OpenInFullIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
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
                {...inputProps}
              />
            </Dialog>
          </InputAdornment>
        ) : undefined
      }
      {...inputProps}
    />
  );
}

JsonTextField.defaultProps = {
  type: 'text',
  inputProps: {},
  disabled: false,
};

const renderItem =
  (
    value: JsonArray,
    onChange: (
      value: JsonArray,
      change: JsonChange,
      objectKeys?: string[],
    ) => void,
    childrenObjectKeys: (string[] | null)[] | null,
    setChildrenObjectKeys: (
      childrenObjectKeys: (string[] | null)[] | null,
    ) => void,
    handleHovered: boolean[],
    setHandleHovered: (handleHovered: boolean[]) => void,
    objectKeys: string[],
    removeButton: (k: string | number) => React.ReactNode,
    startComponentBuilder: (accessor: (string | number)[]) => React.ReactNode,
    endComponentBuilder: (accessor: (string | number)[]) => React.ReactNode,
    afterRemoveButtonComponentBuilder: (
      accessor: (string | number)[],
    ) => React.ReactNode,
    builderAccessor: (string | number)[],
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
          <Box display="flex" flexDirection="row" alignItems="center">
            {(isJsonObject(v) || isJsonArray(v)) && (
              <>
                {startComponentBuilder?.(builderAccessor?.concat(i)!)}
                <Typography variant="body1">
                  {isJsonObject(v) ? '{' : isJsonArray(v) ? '[' : ''}
                </Typography>
              </>
            )}
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center">
            {!(isJsonObject(v) || isJsonArray(v)) &&
              startComponentBuilder?.(builderAccessor?.concat(i)!)}
            <JsonEditor
              value={v}
              onChange={(w, change, childrenK) => {
                onChange(
                  value.map((x, j) => (j === i ? w : x)),
                  {
                    ...change,
                    accessor: ([i] as (string | number)[]).concat(
                      change.accessor,
                    ),
                  },
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
              startComponentBuilder={startComponentBuilder}
              endComponentBuilder={endComponentBuilder}
              afterRemoveButtonComponentBuilder={
                afterRemoveButtonComponentBuilder
              }
              builderAccessor={builderAccessor?.concat(i)}
            />
            {!(isJsonObject(v) || isJsonArray(v)) && (
              <>
                {endComponentBuilder?.(builderAccessor?.concat(i)!)}
                {removeButton(i)}
                {afterRemoveButtonComponentBuilder?.(
                  builderAccessor?.concat(i)!,
                )}
              </>
            )}
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center">
            {(isJsonObject(v) || isJsonArray(v)) && (
              <>
                <Typography variant="body1">
                  {isJsonObject(v) ? '}' : isJsonArray(v) ? ']' : ''}
                </Typography>
                {endComponentBuilder?.(builderAccessor?.concat(i)!)}
                {removeButton(i)}
                {afterRemoveButtonComponentBuilder?.(
                  builderAccessor?.concat(i)!,
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

interface JsonArrayEditorItemProps {
  value: JsonArray;
  onChange: (
    value: JsonArray,
    change: JsonChange,
    objectKeys?: string[],
  ) => void;
  childrenObjectKeys: (string[] | null)[] | null;
  setChildrenObjectKeys: (
    childrenObjectKeys: (string[] | null)[] | null,
  ) => void;
  handleHovered: boolean[];
  setHandleHovered: (handleHovered: boolean[]) => void;
  objectKeys: string[];
  removeButton: (k: string | number) => React.ReactNode;
  startComponentBuilder: (accessor: (string | number)[]) => React.ReactNode;
  endComponentBuilder: (accessor: (string | number)[]) => React.ReactNode;
  afterRemoveButtonComponentBuilder: (
    accessor: (string | number)[],
  ) => React.ReactNode;
  builderAccessor: (string | number)[];
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
  startComponentBuilder,
  endComponentBuilder,
  afterRemoveButtonComponentBuilder,
  builderAccessor,
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
        startComponentBuilder,
        endComponentBuilder,
        afterRemoveButtonComponentBuilder,
        builderAccessor,
      )}
    </Draggable>
  );
}

interface JsonArrayEditorProps {
  value: JsonArray;
  onChange: (
    value: JsonArray,
    change: JsonChange,
    objectKeys?: string[],
  ) => void;
  childrenObjectKeys: (string[] | null)[] | null;
  setChildrenObjectKeys: (
    childrenObjectKeys: (string[] | null)[] | null,
  ) => void;
  objectKeys: string[];
  base: boolean;
  addButton: React.ReactNode;
  removeButton: (k: string | number) => React.ReactNode;
  startComponentBuilder: (accessor: (string | number)[]) => React.ReactNode;
  endComponentBuilder: (accessor: (string | number)[]) => React.ReactNode;
  afterRemoveButtonComponentBuilder: (
    accessor: (string | number)[],
  ) => React.ReactNode;
  builderAccessor: (string | number)[];
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
  startComponentBuilder,
  endComponentBuilder,
  afterRemoveButtonComponentBuilder,
  builderAccessor,
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

    onChange(
      newValue,
      {
        type: JsonChangeType.Reorder,
        accessor: [],
        from: result.source.index,
        to: result.destination.index,
      } as JsonReorderChange,
      objectKeys,
    );
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
              startComponentBuilder,
              endComponentBuilder,
              afterRemoveButtonComponentBuilder,
              builderAccessor,
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
                startComponentBuilder={startComponentBuilder}
                endComponentBuilder={endComponentBuilder}
                afterRemoveButtonComponentBuilder={
                  afterRemoveButtonComponentBuilder
                }
                builderAccessor={builderAccessor}
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
  onChange: (
    value: JsonValue,
    change: JsonChange,
    objectKeys?: string[],
  ) => void;
  objectKeys?: string[];
  base?: boolean;
  jsonChoices?: { [key: string]: JsonChoice };
  generateKey?: (existingKeys: string[]) => string;
  startComponentBuilder?: (accessor: (string | number)[]) => React.ReactNode;
  endComponentBuilder?: (accessor: (string | number)[]) => React.ReactNode;
  afterRemoveButtonComponentBuilder?: (
    accessor: (string | number)[],
  ) => React.ReactNode;
  builderAccessor?: (string | number)[];
}

function JsonEditor({
  value,
  onChange,
  objectKeys,
  base,
  jsonChoices,
  generateKey,
  startComponentBuilder,
  endComponentBuilder,
  afterRemoveButtonComponentBuilder,
  builderAccessor,
}: JsonEditorProps) {
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
    onChange(
      newV,
      {
        type: JsonChangeType.Key,
        accessor: [],
        from: old,
        to: k,
      } as JsonKeyChange,
      newObjectKeys,
    );
  };

  const handleAdd = (v: JsonValue) => {
    if (isJsonObject(value)) {
      const key = generateKey!(objectKeys ?? []);

      onChange(
        { ...value, [key]: v },
        {
          type: JsonChangeType.Add,
          accessor: [],
          key,
          value: v,
        } as JsonAddChange,
        [...(objectKeys ?? []), key],
      );
    } else if (isJsonArray(value)) {
      onChange(
        [...value, v],
        {
          type: JsonChangeType.Add,
          accessor: [],
          value: v,
        } as JsonAddChange,
        objectKeys,
      );
    }

    setAddMenu(false);
  };

  const handleRemove = (k: string | number) => {
    if (isJsonObject(value)) {
      const newValue = { ...value };
      delete newValue[k];
      const newObjectKeys = objectKeys?.filter((x) => x !== k);
      onChange(
        newValue,
        {
          type: JsonChangeType.Remove,
          accessor: [],
          key: k,
        } as JsonRemoveChange,
        newObjectKeys,
      );
    } else if (isJsonArray(value)) {
      const newValue = [...value];
      newValue.splice(k as number, 1);
      onChange(
        newValue,
        {
          type: JsonChangeType.Remove,
          accessor: [],
          key: k,
        } as JsonRemoveChange,
        objectKeys,
      );
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked, {
      type: JsonChangeType.Edit,
      accessor: [],
      value: e.target.checked,
    } as JsonEditChange);
  };

  const addButtons = (
    <>
      <Button
        variant="outlined"
        onClick={() => setAddMenu(!addMenu)}
        startIcon={<AddIcon />}
        sx={{
          backgroundColor: addMenu
            ? alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity,
              )
            : undefined,
        }}
      >
        <Typography>Add</Typography>
      </Button>
      <Collapse in={addMenu}>
        <ButtonGroup orientation="vertical" variant="contained" fullWidth>
          {Object.entries(jsonChoices as object).map(([k, v]) => (
            <Button key={k} onClick={() => handleAdd(v.default)}>
              {v.name}
            </Button>
          ))}
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
          onChange={(v, c) => onChange(v, c, objectKeys)}
        />
      ) : typeof value === 'number' ? (
        <JsonTextField
          type="number"
          value={value}
          onChange={(v, c) => onChange(Number(v), c, objectKeys)}
        />
      ) : typeof value === 'boolean' ? (
        <FormControlLabel
          control={<Checkbox checked={value} onChange={handleCheckboxChange} />}
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
                <Typography variant="body1">:</Typography>
                {startComponentBuilder?.(builderAccessor?.concat(k)!)}
                <Typography variant="body1">
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
                      onChange={(w, change, childrenK) => {
                        onChange(
                          { ...value, [k]: w },
                          {
                            ...change,
                            accessor: ([k] as (string | number)[]).concat(
                              change.accessor,
                            ),
                          },
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
                      objectKeys={childrenObjectKeys![i] ?? undefined}
                      jsonChoices={jsonChoices}
                      startComponentBuilder={startComponentBuilder}
                      endComponentBuilder={endComponentBuilder}
                      afterRemoveButtonComponentBuilder={
                        afterRemoveButtonComponentBuilder
                      }
                      builderAccessor={builderAccessor?.concat(k)}
                    />
                    {endComponentBuilder?.(builderAccessor?.concat(k)!)}
                    {removeButton(k)}
                    {afterRemoveButtonComponentBuilder?.(
                      builderAccessor?.concat(k)!,
                    )}
                  </>
                )}
              </Box>
              {(isJsonObject(value[k]) || isJsonArray(value[k])) && (
                <>
                  <JsonEditor
                    value={value[k]}
                    onChange={(w, change, childrenK) => {
                      onChange(
                        { ...value, [k]: w },
                        {
                          ...change,
                          accessor: ([k] as (string | number)[]).concat(
                            change.accessor,
                          ),
                        },
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
                    objectKeys={childrenObjectKeys![i] ?? undefined}
                    jsonChoices={jsonChoices}
                    startComponentBuilder={startComponentBuilder}
                    endComponentBuilder={endComponentBuilder}
                    afterRemoveButtonComponentBuilder={
                      afterRemoveButtonComponentBuilder
                    }
                    builderAccessor={builderAccessor?.concat(k)}
                  />
                  <Box display="flex" flexDirection="row" alignItems="center">
                    <Typography variant="body1">
                      {isJsonObject(value[k])
                        ? '}'
                        : isJsonArray(value[k])
                        ? ']'
                        : ''}
                    </Typography>
                    {endComponentBuilder?.(builderAccessor?.concat(k)!)}
                    {removeButton(k)}
                    {afterRemoveButtonComponentBuilder?.(
                      builderAccessor?.concat(k)!,
                    )}
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
          startComponentBuilder={startComponentBuilder!}
          endComponentBuilder={endComponentBuilder!}
          afterRemoveButtonComponentBuilder={afterRemoveButtonComponentBuilder!}
          builderAccessor={builderAccessor!}
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
  jsonChoices: DefaultJsonChoices,
  generateKey: (existingKeys: string[]) => {
    let key = 'Key';
    if (existingKeys.includes(key)) {
      let i = 1;
      while (existingKeys.includes(`${key} ${i}`)) {
        i += 1;
      }
      key = `${key} ${i}`;
    }
    return key;
  },
  startComponentBuilder: () => null,
  endComponentBuilder: () => null,
  afterRemoveButtonComponentBuilder: () => null,
  builderAccessor: [],
};

export default JsonEditor;
