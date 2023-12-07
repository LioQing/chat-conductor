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
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { type RichTextEditorRef } from 'mui-tiptap';
import JsonEditor from './JsonEditor';
import { JsonObject, JsonTypeName } from '../utils/JsonObject';
import { ComponentInstance } from '../models/ComponentInstance';
import MarkdownEditor from './MarkdownEditor';

const componentToComponentAndKeys = (
  component: ComponentInstance,
): ComponentAndKeys => ({
  component,
  stateKeys: Object.entries(component.state).map(([k]) => k),
  argumentKeys: Object.entries(component.arguments).map(([k]) => k),
});

const buttonBaseSx = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 1,
  p: 1,
  pl: 0,
};

export interface ComponentAndKeys {
  component: ComponentInstance;
  stateKeys: string[];
  argumentKeys: string[];
}

export interface ComponentAttributesRef {
  getComponent: () => ComponentInstance;
}

export interface ComponentAttributesProps {
  component: ComponentInstance;
  onChange: () => void;
}

const ComponentAttributes = React.forwardRef(
  (
    { component, onChange }: ComponentAttributesProps,
    ref: React.Ref<ComponentAttributesRef>,
  ) => {
    const theme = useTheme();

    const [componentAndKeys, setComponentAndKeys] =
      React.useState<ComponentAndKeys>(componentToComponentAndKeys(component));

    const [signatureOpened, setSignatureOpened] = React.useState(false);
    const [stateOpened, setStateOpened] = React.useState(false);
    const [descriptionOpened, setDescriptionOpened] = React.useState(false);
    const [codeOpened, setCodeOpened] = React.useState(false);

    const rteRef = React.useRef<RichTextEditorRef>(null);

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
      setComponentAndKeys({
        ...componentAndKeys,
        component: { ...componentAndKeys.component, name: e.target.value },
      });
      onChange();
    };

    const handleChangeFunctionName = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      setComponentAndKeys({
        ...componentAndKeys,
        component: {
          ...componentAndKeys.component,
          function_name: e.target.value,
        },
      });
      onChange();
    };

    const handleChangeArguments = (v: JsonObject, k?: string[]) => {
      setComponentAndKeys({
        ...componentAndKeys,
        component: { ...componentAndKeys.component, arguments: v },
        argumentKeys: k!,
      });
      onChange();
    };

    const handleChangeReturnType = (e: any) => {
      setComponentAndKeys({
        ...componentAndKeys,
        component: {
          ...componentAndKeys.component,
          return_type: e.target.value,
        },
      });
      onChange();
    };

    const handleChangeState = (v: JsonObject, k?: string[]) => {
      setComponentAndKeys({
        ...componentAndKeys,
        component: { ...componentAndKeys.component, state: v },
        stateKeys: k ?? componentAndKeys.stateKeys,
      });
      onChange();
    };

    const handleChangeCode = (v: string | undefined) => {
      if (!v) return;

      setComponentAndKeys({
        ...componentAndKeys,
        component: { ...componentAndKeys.component, code: v },
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
      const currCode = componentAndKeys.component.code;

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

      const def = `\n\ndef ${componentAndKeys.component.function_name}(`;
      const args = Object.entries(
        componentAndKeys.component.arguments ?? {},
      ).map(([k, v]) => {
        const type = jsonToPythonType[JsonTypeName(v)];
        return `${k}: ${type}`;
      });
      const argsStr = args.length > 2 ? args.join(',\n    ') : args.join(', ');
      const returnType =
        selectToPythonType[componentAndKeys.component.return_type];
      const returnStr = `${args.length > 2 ? '\n' : ''}) -> ${returnType}:`;

      const code = `${currCode}${def}${argsStr}${returnStr}`;

      setComponentAndKeys({
        ...componentAndKeys,
        component: { ...componentAndKeys.component, code },
      });
    };

    // code editor

    const handleEditorSizeChange =
      (editor: editor.IStandaloneCodeEditor) => () => {
        const height = Math.max(180, Math.min(540, editor.getContentHeight()));
        editor.layout({
          width: editor.getLayoutInfo().width,
          height,
        });
      };

    const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
      handleEditorSizeChange(editor)();
      editor.onDidContentSizeChange(handleEditorSizeChange(editor));
    };

    // effect

    React.useEffect(() => {
      setComponentAndKeys(componentToComponentAndKeys(component));
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
          rteRef.current?.editor?.storage.markdown.getMarkdown();

        if (!description) {
          console.error('description is empty');
          return componentAndKeys.component;
        }

        const updatedComponent = {
          ...componentAndKeys.component,
          description,
        };

        return updatedComponent;
      },
    }));

    return (
      <Box display="flex" flexDirection="column" minHeight={0} mb={1}>
        <Box mb={1}>
          <TextField
            value={componentAndKeys.component.name}
            onChange={handleChangeName}
            label="Name"
            size="small"
            variant="standard"
            autoComplete="new-password"
            sx={{ my: 1, flex: 1 }}
          />
          <Typography variant="body2">
            Component ID: {componentAndKeys.component.component_id}
          </Typography>
          <Typography variant="body2">
            Created at: {componentAndKeys.component.created_at.toLocaleString()}
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
                  value={componentAndKeys.component.function_name}
                  onChange={handleChangeFunctionName}
                  label="Function Name"
                  size="small"
                  variant="outlined"
                  autoComplete="new-password"
                  sx={{ my: 1, flex: 1 }}
                />
                <TextField
                  value={componentAndKeys.component.return_type}
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
                  value={componentAndKeys.component.arguments}
                  onChange={(v, k) => handleChangeArguments(v as JsonObject, k)}
                  objectKeys={componentAndKeys.argumentKeys}
                  base
                  jsonChoices={{
                    string: { name: 'String', default: 'Value' },
                    number: { name: 'Number', default: 0 },
                    boolean: { name: 'Boolean', default: false },
                    array: { name: 'List', default: [] },
                    object: { name: 'Dictionary', default: {} },
                    null: { name: 'None', default: null },
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={handleGenerateFunctionSignature}
                startIcon={<AutoAwesomeIcon />}
              >
                Generate Function Signature
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
                value={componentAndKeys.component.state}
                onChange={(v, k) => handleChangeState(v as JsonObject, k)}
                objectKeys={componentAndKeys.stateKeys}
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
              <MarkdownEditor
                ref={rteRef}
                content={componentAndKeys.component.description}
                onUpdate={onChange}
              />
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
                value={componentAndKeys.component.code}
                onMount={handleEditorMount}
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
