import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {
  RichTextEditor,
  FontSize,
  type RichTextEditorRef,
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectFontSize,
  MenuButtonUnderline,
  MenuButtonStrikethrough,
  MenuButtonSubscript,
  MenuButtonSuperscript,
  MenuButtonBlockquote,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonUndo,
  MenuButtonRedo,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuButtonTaskList,
} from 'mui-tiptap';
import JsonEditor from './JsonEditor';
import { JsonObject } from '../utils/JsonObject';
import { ComponentInstance } from '../models/ComponentInstance';

export interface ComponentAndStateKeys {
  component: ComponentInstance;
  stateKeys: string[];
}

export interface ComponentAttributesProps {
  componentAndStateKeys: ComponentAndStateKeys;
  setComponentAndStateKeys: (v: ComponentAndStateKeys) => void;
}

function ComponentAttributes({
  componentAndStateKeys: { component, stateKeys },
  setComponentAndStateKeys,
}: ComponentAttributesProps) {
  const rteRef = React.useRef<RichTextEditorRef>(null);

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComponentAndStateKeys({
      component: { ...component, name: e.target.value },
      stateKeys,
    });
  };

  const handleChangeFunctionName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComponentAndStateKeys({
      component: { ...component, function_name: e.target.value },
      stateKeys,
    });
  };

  const handleChangeDescription = (v: JsonObject) => {
    setComponentAndStateKeys({
      component: { ...component, description: v },
      stateKeys,
    });
  };

  const handleChangeState = (v: JsonObject, k?: string[]) => {
    setComponentAndStateKeys({
      component: { ...component, state: v },
      stateKeys: k!,
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap={1} minHeight={0} mb={1}>
      <Box>
        <Box display="flex" flexDirection="row" gap={2}>
          <TextField
            value={component.name}
            onChange={handleChangeName}
            label="Name"
            size="small"
            variant="standard"
            autoComplete="new-password" // https://learn.microsoft.com/en-us/answers/questions/974921/edge-bug-autocomplete-off-still-displays-previousl
            sx={{ my: 1, flex: 1 }}
          />
          <TextField
            value={component.function_name}
            onChange={handleChangeFunctionName}
            label="Function Name"
            size="small"
            variant="standard"
            autoComplete="new-password" // https://learn.microsoft.com/en-us/answers/questions/974921/edge-bug-autocomplete-off-still-displays-previousl
            sx={{ my: 1, flex: 1 }}
          />
        </Box>
        <Typography variant="body2">
          Component ID: {component.component_id}
        </Typography>
        <Typography variant="body2">
          Created at: {component.created_at.toLocaleString()}
        </Typography>
      </Box>
      <Divider />
      <Box>
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <RichTextEditor
          ref={rteRef}
          extensions={[
            StarterKit,
            TextStyle,
            FontSize,
            Underline,
            TaskList,
            TaskItem,
            Subscript,
            Superscript,
          ]}
          content={component.description}
          onUpdate={({ editor }) => handleChangeDescription(editor.getJSON())}
          renderControls={() => (
            <MenuControlsContainer>
              <MenuSelectFontSize />
              <MenuDivider />
              <MenuButtonBold />
              <MenuButtonItalic />
              <MenuButtonUnderline />
              <MenuButtonStrikethrough />
              <MenuButtonSubscript />
              <MenuButtonSuperscript />
              <MenuDivider />
              <MenuButtonBulletedList />
              <MenuButtonOrderedList />
              <MenuButtonTaskList />
              <MenuDivider />
              <MenuButtonBlockquote />
              <MenuDivider />
              <MenuButtonCode />
              <MenuButtonCodeBlock />
              <MenuDivider />
              <MenuButtonUndo />
              <MenuButtonRedo />
            </MenuControlsContainer>
          )}
        />
      </Box>
      <Divider />
      <Typography variant="h6">State</Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <JsonEditor
          value={component.state}
          onChange={(v, k) => handleChangeState(v as JsonObject, k)}
          objectKeys={stateKeys}
          base
        />
      </Box>
    </Box>
  );
}

export default ComponentAttributes;
