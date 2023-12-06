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
import { Editor as TipTapEditor } from '@tiptap/react';
import JsonEditor from './JsonEditor';
import { JsonObject, JsonTypeName } from '../utils/JsonObject';
import { ComponentInstance } from '../models/ComponentInstance';
import MarkdownEditor from './MarkdownEditor';

const buttonBaseSx = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 1,
  p: 1,
  pl: 0,
};

export interface ComponentAndStateKeys {
  component: ComponentInstance;
  stateKeys: string[];
  argumentKeys: string[];
}

export interface ComponentAttributesProps {
  componentAndStateKeys: ComponentAndStateKeys;
  setComponentAndStateKeys: (v: ComponentAndStateKeys) => void;
}

function ComponentAttributes({
  componentAndStateKeys: { component, stateKeys, argumentKeys },
  setComponentAndStateKeys,
}: ComponentAttributesProps) {
  const theme = useTheme();

  const [signatureOpened, setSignatureOpened] = React.useState(false);
  const [stateOpened, setStateOpened] = React.useState(false);
  const [descriptionOpened, setDescriptionOpened] = React.useState(false);
  const [codeOpened, setCodeOpened] = React.useState(false);

  const rteRef = React.useRef<RichTextEditorRef>(null);

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComponentAndStateKeys({
      component: { ...component, name: e.target.value },
      stateKeys,
      argumentKeys,
    });
  };

  const handleChangeFunctionName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComponentAndStateKeys({
      component: { ...component, function_name: e.target.value },
      stateKeys,
      argumentKeys,
    });
  };

  const handleChangeDescription = (v: string) => {
    setComponentAndStateKeys({
      component: { ...component, description: v },
      stateKeys,
      argumentKeys,
    });
  };

  const handleChangeArguments = (v: JsonObject, k?: string[]) => {
    setComponentAndStateKeys({
      component: { ...component, arguments: v },
      stateKeys,
      argumentKeys: k!,
    });
  };

  const handleChangeReturnType = (e: any) => {
    setComponentAndStateKeys({
      component: { ...component, return_type: e.target.value },
      stateKeys,
      argumentKeys,
    });
  };

  const handleChangeState = (v: JsonObject, k?: string[]) => {
    setComponentAndStateKeys({
      component: { ...component, state: v },
      stateKeys: k!,
      argumentKeys,
    });
  };

  const handleChangeCode = (v: string | undefined) => {
    if (!v) return;

    setComponentAndStateKeys({
      component: { ...component, code: v },
      stateKeys,
      argumentKeys,
    });
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
    const currCode = component.code;

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

    const def = `\n\ndef ${component.function_name}(`;
    const args = Object.entries(component.arguments ?? {}).map(([k, v]) => {
      const type = jsonToPythonType[JsonTypeName(v)];
      return `${k}: ${type}`;
    });
    const argsStr = args.length > 2 ? args.join(',\n    ') : args.join(', ');
    const returnType = selectToPythonType[component.return_type];
    const returnStr = `${args.length > 2 ? '\n' : ''}) -> ${returnType}:`;

    const code = `${currCode}${def}${argsStr}${returnStr}`;

    setComponentAndStateKeys({
      component: { ...component, code },
      stateKeys,
      argumentKeys,
    });
  };

  const onEditorSizeChange = (editor: editor.IStandaloneCodeEditor) => () => {
    const height = Math.max(180, Math.min(540, editor.getContentHeight()));
    editor.layout({
      width: editor.getLayoutInfo().width,
      height,
    });
  };

  const onEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    onEditorSizeChange(editor)();
    editor.onDidContentSizeChange(onEditorSizeChange(editor));
  };

  React.useEffect(() => {
    if (!rteRef.current?.editor) return;

    rteRef.current.editor.commands.setContent(component.description);
  }, [component.id]);

  return (
    <Box display="flex" flexDirection="column" minHeight={0} mb={1}>
      <Box mb={1}>
        <TextField
          value={component.name}
          onChange={handleChangeName}
          label="Name"
          size="small"
          variant="standard"
          autoComplete="new-password"
          sx={{ my: 1, flex: 1 }}
        />
        <Typography variant="body2">
          Component ID: {component.component_id}
        </Typography>
        <Typography variant="body2">
          Created at: {component.created_at.toLocaleString()}
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
                value={component.function_name}
                onChange={handleChangeFunctionName}
                label="Function Name"
                size="small"
                variant="outlined"
                autoComplete="new-password"
                sx={{ my: 1, flex: 1 }}
              />
              <TextField
                value={component.return_type}
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
                value={component.arguments}
                onChange={(v, k) => handleChangeArguments(v as JsonObject, k)}
                objectKeys={argumentKeys}
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
              value={component.state}
              onChange={(v, k) => handleChangeState(v as JsonObject, k)}
              objectKeys={stateKeys}
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
              content={component.description}
              onUpdate={({ editor }: { editor: TipTapEditor }) =>
                handleChangeDescription(editor.storage.markdown.getMarkdown())
              }
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
              value={component.code}
              onMount={onEditorMount}
              onChange={handleChangeCode}
            />
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}

export default ComponentAttributes;
