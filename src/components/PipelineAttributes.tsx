import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ButtonBase from '@mui/material/ButtonBase';
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
import { PipelineAttributes as PipelineAttributesData } from '../models/PipelineAttributes';

const buttonBaseSx = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 1,
  p: 1,
  pl: 0,
};

export interface PipelineAttributesAndKeys {
  attributes: PipelineAttributesData;
  stateKeys: string[];
}

export interface PipelienAttributesProps {
  pipelineAttributesAndKeys: PipelineAttributesAndKeys;
  setPipelineAttributesAndKeys: (
    pipelineAttributesAndKeys: PipelineAttributesAndKeys,
  ) => void;
}

function PipelineAttributes({
  pipelineAttributesAndKeys: { attributes, stateKeys },
  setPipelineAttributesAndKeys,
}: PipelienAttributesProps) {
  const [stateOpened, setStateOpened] = React.useState(false);
  const [descriptionOpened, setDescriptionOpened] = React.useState(false);

  const rteRef = React.useRef<RichTextEditorRef>(null);

  const handleChangeDescription = (v: JsonObject) => {
    setPipelineAttributesAndKeys({
      attributes: { ...attributes, description: v },
      stateKeys,
    });
  };

  const handleChangeState = (v: JsonObject, k?: string[]) => {
    setPipelineAttributesAndKeys({
      attributes: { ...attributes, state: v },
      stateKeys: k!,
    });
  };

  const handleStateToggle = () => {
    setStateOpened((prev) => !prev);
  };

  const handleDescriptionToggle = () => {
    setDescriptionOpened((prev) => !prev);
  };

  React.useEffect(() => {
    if (!rteRef.current?.editor) return;

    rteRef.current.editor.commands.setContent(attributes.description);
  }, [attributes.description]);

  return (
    <Box display="flex" flexDirection="column" minHeight={0} mb={1}>
      <Box display="flex" flexDirection="column">
        <ButtonBase onClick={handleStateToggle} sx={buttonBaseSx}>
          <Typography variant="h6">State</Typography>
          <Box flexGrow={1} />
          {stateOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ButtonBase>
        <Collapse in={stateOpened}>
          <Box sx={{ overflowX: 'auto' }} my={1}>
            <JsonEditor
              value={attributes.state}
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
              content={attributes.description}
              onUpdate={({ editor }) =>
                handleChangeDescription(editor.getJSON())
              }
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
        </Collapse>
      </Box>
    </Box>
  );
}

export default PipelineAttributes;
