/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ButtonBase from '@mui/material/ButtonBase';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { type RichTextEditorRef } from 'mui-tiptap';
import JsonEditor, {
  JsonAddChange,
  JsonChange,
  JsonChangeType,
  JsonEditChange,
  JsonKeyChange,
  JsonRemoveChange,
  JsonReorderChange,
  JsonTextField,
} from './JsonEditor';
import { JsonObject, JsonTypeName, isJsonObject } from '../utils/JsonObject';
import { ComponentInstance } from '../models/ComponentInstance';
import MarkdownEditor from './MarkdownEditor';
import useLocalStorage from '../hooks/useLocalStorage';
import {
  Argument,
  ArgumentObject,
  fromDefault,
  getArgument,
  setArgument,
  toDefault,
} from '../utils/Argument';

const componentToStates = (
  component: ComponentInstance,
): ComponentAttributesStates => {
  const argObject: JsonObject = {};
  Object.entries(component.arguments).forEach(([k, v]) => {
    argObject[k] = toDefault(v);
  });

  return {
    component,
    stateKeys: Object.entries(component.state).map(([k]) => k),
    argObject,
    argKeys: Object.entries(argObject).map(([k]) => k),
  };
};

const buttonBaseSx = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 1,
  p: 1,
  pl: 0,
};

interface ComponentAttributesStates {
  component: ComponentInstance;
  stateKeys: string[];
  argObject: JsonObject;
  argKeys: string[];
}

export interface ComponentAttributesRef {
  getComponent: () => ComponentInstance;
}

export interface ComponentAttributesProps {
  component: ComponentInstance;
  markdown: boolean;
  onChange: () => void;
}

const ComponentAttributes = React.forwardRef(
  (
    { component, markdown, onChange }: ComponentAttributesProps,
    ref: React.Ref<ComponentAttributesRef>,
  ) => {
    const theme = useTheme();
    const [openedSections, setOpenedSections] = useLocalStorage<string[]>(
      'ComponentAttributes:openedSections',
      [],
    );

    const [states, setStates] = React.useState<ComponentAttributesStates>(
      componentToStates(component),
    );

    const [signatureOpened, setSignatureOpened] = React.useState(
      openedSections.includes('signature'),
    );
    const [stateOpened, setStateOpened] = React.useState(
      openedSections.includes('state'),
    );
    const [descriptionOpened, setDescriptionOpened] = React.useState(
      openedSections.includes('description'),
    );
    const [codeOpened, setCodeOpened] = React.useState(
      openedSections.includes('code'),
    );

    const rteRef = React.useRef<RichTextEditorRef>(null);

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
      setStates({
        ...states,
        component: { ...states.component, name: e.target.value },
      });
      onChange();
    };

    const handleChangeFunctionName = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      setStates({
        ...states,
        component: {
          ...states.component,
          function_name: e.target.value,
        },
      });
      onChange();
    };

    const handleChangeArguments = (
      v: JsonObject,
      c: JsonChange,
      k?: string[],
    ) => {
      if (k === undefined) {
        console.error('k is undefined');
        return;
      }

      const newStates = (() => {
        const fakeBaseArg = {
          enabled: false,
          interpolated: '',
          default: states.component.arguments,
        };
        const arg = getArgument(fakeBaseArg, c.accessor);

        if (arg === undefined) {
          console.error('arg is undefined');
          return states;
        }

        const { default: def } = arg;

        if (c.type === JsonChangeType.Add) {
          const addChange = c as JsonAddChange;

          if (addChange.key !== undefined) {
            if (!isJsonObject(def)) {
              console.error('def is not a JsonObject');
              return states;
            }

            def[addChange.key] = fromDefault(addChange.value);
          } else {
            if (!Array.isArray(def)) {
              console.error('def is not an array');
              return states;
            }

            def.push(fromDefault(addChange.value));
          }
        } else if (c.type === JsonChangeType.Remove) {
          const removeChange = c as JsonRemoveChange;

          if (typeof removeChange.key === 'string') {
            if (!isJsonObject(def)) {
              console.error('def is not a JsonObject');
              return states;
            }

            delete def[removeChange.key];
          } else {
            if (!Array.isArray(def)) {
              console.error('def is not an array');
              return states;
            }

            def.splice(removeChange.key, 1);
          }
        } else if (c.type === JsonChangeType.Edit) {
          const editChange = c as JsonEditChange;

          arg.default = editChange.value;
        } else if (c.type === JsonChangeType.Reorder) {
          const reorderChange = c as JsonReorderChange;

          if (!Array.isArray(def)) {
            console.error('def is not an array');
            return states;
          }

          const [removed] = def.splice(reorderChange.from, 1);
          def.splice(reorderChange.to, 0, removed);
        } else if (c.type === JsonChangeType.Key) {
          const keyChange = c as JsonKeyChange;

          if (!isJsonObject(def)) {
            console.error('def is not a JsonObject');
            return states;
          }

          const value = def[keyChange.from];
          delete def[keyChange.from];
          def[keyChange.to] = value;
        }

        states.argKeys = k;
        states.argObject = v;

        return states;
      })();

      setStates({ ...newStates });
      onChange();
    };

    const handleChangeReturnType = (e: any) => {
      setStates({
        ...states,
        component: {
          ...states.component,
          return_type: e.target.value,
        },
      });
      onChange();
    };

    const handleChangeState = (v: JsonObject, k?: string[]) => {
      if (k === undefined) {
        console.error('k is undefined');
        return;
      }

      setStates({
        ...states,
        component: { ...states.component, state: v },
        stateKeys: k,
      });
      onChange();
    };

    const handleChangeDescription = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      setStates({
        ...states,
        component: { ...states.component, description: e.target.value },
      });
      onChange();
    };

    const handleChangeCode = (v: string | undefined) => {
      if (!v) {
        console.error('v is undefined');
        return;
      }

      setStates({
        ...states,
        component: { ...states.component, code: v },
      });
      onChange();
    };

    const handleSignatureToggle = () => {
      setSignatureOpened((prev) => !prev);
    };

    const handleStateToggle = () => {
      setStateOpened((prev) => !prev);
    };

    const handleDescriptionToggle = () => {
      setDescriptionOpened((prev) => !prev);
    };

    const handleCodeToggle = () => {
      setCodeOpened((prev) => !prev);
    };

    const handleGenerateFunctionSignature = () => {
      const currCode = states.component.code;

      const jsonToPythonType: { [key: string]: string } = {
        null: 'None',
        string: 'str',
        number: 'int | float',
        boolean: 'bool',
        array: 'list',
        object: 'dict',
      };

      const selectToPythonType: { [key: string]: string } = {
        none: 'None',
        string: 'str',
        number: 'int | float',
        boolean: 'bool',
        list: 'list',
        dictionary: 'dict',
      };

      const def = `\n\ndef ${states.component.function_name}(`;
      const args = Object.entries(states.component.arguments ?? {}).map(
        ([k, v]) => {
          const type = jsonToPythonType[JsonTypeName(v.default)];
          return `${k}: ${type}`;
        },
      );
      const argsStr = args.length > 2 ? args.join(',\n    ') : args.join(', ');
      const returnType = selectToPythonType[states.component.return_type];
      const returnStr = `${args.length > 2 ? '\n' : ''}) -> ${returnType}:`;

      const code = `${currCode}${def}${argsStr}${returnStr}`;

      setStates({
        ...states,
        component: { ...states.component, code },
      });
    };

    // effect

    React.useEffect(() => {
      const newOpenedSections = [];
      if (signatureOpened) newOpenedSections.push('signature');
      if (stateOpened) newOpenedSections.push('state');
      if (descriptionOpened) newOpenedSections.push('description');
      if (codeOpened) newOpenedSections.push('code');
      setOpenedSections(newOpenedSections);
    }, [signatureOpened, stateOpened, descriptionOpened, codeOpened]);

    React.useEffect(() => {
      setStates(componentToStates(component));
    }, [component]);

    React.useEffect(() => {
      if (!rteRef.current?.editor) return;

      rteRef.current.editor.commands.setContent(component.description);
    }, [component.description]);

    // imperative

    React.useImperativeHandle(ref, () => ({
      getComponent: () => {
        // lazy update description
        const description: string | null =
          rteRef.current?.editor?.storage.markdown.getMarkdown() ??
          states.component.description ??
          null;

        if (description === null) {
          console.error('description is null');
          return states.component;
        }

        const updatedComponent = {
          ...states.component,
          description,
        };

        return updatedComponent;
      },
    }));

    // components
    const interpolateArgumentComponentBuilder = (
      accessor: (string | number)[],
    ) => {
      const getFakeBaseArg = (cak: ComponentAttributesStates): Argument => ({
        enabled: false,
        interpolated: '',
        default: cak.component.arguments,
      });

      const fakeBaseArg = getFakeBaseArg(states);
      const arg = getArgument(fakeBaseArg, accessor);

      if (arg === undefined) {
        console.error('arg is undefined');
        return null;
      }

      const { enabled, interpolated, default: def } = arg;

      return (
        <Box display="flex" flexDirection="row" mx={1}>
          <Checkbox
            checked={enabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newArg = setArgument(fakeBaseArg, accessor, {
                enabled: e.target.checked,
                interpolated,
                default: def,
              });

              const newCompnentAndKeys = {
                ...states,
                component: {
                  ...states.component,
                  arguments: newArg.default as ArgumentObject,
                },
              };

              setStates(newCompnentAndKeys);
            }}
          />
          <JsonTextField
            value={interpolated}
            onChange={(v: string) => {
              const newArg = setArgument(fakeBaseArg, accessor, {
                enabled,
                interpolated: v,
                default: def,
              });

              const newCompnentAndKeys = {
                ...states,
                component: {
                  ...states.component,
                  arguments: newArg.default as ArgumentObject,
                },
              };

              setStates(newCompnentAndKeys);
            }}
            disabled={!enabled}
            inputProps={{
              placeholder: 'Interpolated',
            }}
          />
        </Box>
      );
    };

    return (
      <Box display="flex" flexDirection="column" minHeight={0} mb={1}>
        <Box mb={1}>
          <TextField
            value={states.component.name}
            onChange={handleChangeName}
            label="Name"
            size="small"
            variant="standard"
            autoComplete="new-password"
            sx={{ my: 1, flex: 1 }}
          />
          <Typography variant="body2">
            Component ID: {states.component.component_id}
          </Typography>
          <Typography variant="body2">
            Created At: {new Date(states.component.created_at).toLocaleString()}
          </Typography>
        </Box>
        <Divider />
        <Box display="flex" flexDirection="column">
          <ButtonBase onClick={handleSignatureToggle} sx={buttonBaseSx}>
            <Typography variant="h6">Signature</Typography>
            <Box flexGrow={1} />
            {signatureOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ButtonBase>
          <Collapse in={signatureOpened}>
            <Box display="flex" flexDirection="column" gap={1} my={1}>
              <Box display="flex" flexDirection="row" gap={2}>
                <TextField
                  value={states.component.function_name}
                  onChange={handleChangeFunctionName}
                  label="Function Name"
                  size="small"
                  variant="outlined"
                  autoComplete="new-password"
                  sx={{ my: 1, flex: 1 }}
                />
                <TextField
                  value={states.component.return_type}
                  onChange={handleChangeReturnType}
                  label="Return Type"
                  size="small"
                  variant="outlined"
                  select
                  sx={{ my: 1, flex: 1 }}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="string">String</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="boolean">Boolean</MenuItem>
                  <MenuItem value="list">List</MenuItem>
                  <MenuItem value="dictionary">Dictionary</MenuItem>
                </TextField>
              </Box>
              <Typography variant="body1">Parameters & Arguments</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <JsonEditor
                  value={states.argObject}
                  onChange={(v, c, k) =>
                    handleChangeArguments(v as JsonObject, c, k)
                  }
                  objectKeys={states.argKeys}
                  base
                  jsonChoices={{
                    string: { name: 'String', default: 'Value' },
                    number: { name: 'Number', default: 0 },
                    boolean: { name: 'Boolean', default: false },
                    array: { name: 'List', default: [] },
                    object: { name: 'Dictionary', default: {} },
                    null: { name: 'None', default: null },
                  }}
                  generateKey={(existingKeys: string[]) => {
                    let key = 'key';
                    if (existingKeys.includes(key)) {
                      let i = 1;
                      while (existingKeys.includes(`${key}_${i}`)) {
                        i += 1;
                      }
                      key = `${key} ${i}`;
                    }
                    return key;
                  }}
                  endComponentBuilder={interpolateArgumentComponentBuilder}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={handleGenerateFunctionSignature}
                startIcon={<AutoAwesomeIcon />}
              >
                <Typography>Generate Function Signature</Typography>
              </Button>
            </Box>
          </Collapse>
        </Box>
        <Divider />
        <Box display="flex" flexDirection="column">
          <ButtonBase onClick={handleStateToggle} sx={buttonBaseSx}>
            <Typography variant="h6">State</Typography>
            <Box flexGrow={1} />
            {stateOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ButtonBase>
          <Collapse in={stateOpened}>
            <Box sx={{ overflowX: 'auto' }} my={1}>
              <JsonEditor
                value={states.component.state}
                onChange={(v, c, k) => handleChangeState(v as JsonObject, k)}
                objectKeys={states.stateKeys}
                base
              />
            </Box>
          </Collapse>
        </Box>
        <Divider />
        <Box display="flex" flexDirection="column">
          <ButtonBase onClick={handleDescriptionToggle} sx={buttonBaseSx}>
            <Typography variant="h6">Description</Typography>
            <Box flexGrow={1} />
            {descriptionOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ButtonBase>
          <Collapse in={descriptionOpened}>
            <Box my={1}>
              {markdown ? (
                <MarkdownEditor
                  ref={rteRef}
                  content={states.component.description}
                  onUpdate={onChange}
                />
              ) : (
                <TextField
                  value={states.component.description}
                  onChange={handleChangeDescription}
                  variant="outlined"
                  fullWidth
                  multiline
                />
              )}
            </Box>
          </Collapse>
        </Box>
        <Divider />
        <Box display="flex" flexDirection="column">
          <ButtonBase onClick={handleCodeToggle} sx={buttonBaseSx}>
            <Typography variant="h6">Code</Typography>
            <Box flexGrow={1} />
            {codeOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ButtonBase>
          <Collapse in={codeOpened}>
            <Box my={1} overflow="hidden" borderRadius={1}>
              <Editor
                theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                language="python"
                value={states.component.code}
                height="min(50vh, 540px)"
                onChange={handleChangeCode}
              />
            </Box>
          </Collapse>
        </Box>
      </Box>
    );
  },
);

export default ComponentAttributes;
