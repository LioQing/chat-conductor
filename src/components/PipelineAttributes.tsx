import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import { RichTextEditorRef } from 'mui-tiptap';
import MarkdownEditor from './MarkdownEditor';
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

export interface PipelineAttributesRef {
  getDescription: () => string;
}

export interface PipelineAttributesAndKeys {
  attributes: PipelineAttributesData;
  stateKeys: string[];
}

export interface PipelienAttributesProps {
  pipelineAttributesAndKeys: PipelineAttributesAndKeys;
  setPipelineAttributesAndKeys: (
    pipelineAttributesAndKeys: PipelineAttributesAndKeys,
  ) => void;
  onUnsave: () => void;
}

const PipelineAttributes = React.forwardRef(
  (
    {
      pipelineAttributesAndKeys: { attributes, stateKeys },
      setPipelineAttributesAndKeys,
      onUnsave,
    }: PipelienAttributesProps,
    ref,
  ) => {
    const [stateOpened, setStateOpened] = React.useState(false);
    const [descriptionOpened, setDescriptionOpened] = React.useState(false);

    const rteRef = React.useRef<RichTextEditorRef>(null);

    const handleChangeState = (v: JsonObject, k?: string[]) => {
      onUnsave();
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

    React.useImperativeHandle(ref, () => ({
      getDescription: () =>
        rteRef.current?.editor?.storage.markdown.getMarkdown() ?? '',
    }));

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
              <MarkdownEditor
                ref={rteRef}
                content={attributes.description}
                onUpdate={onUnsave}
              />
            </Box>
          </Collapse>
        </Box>
      </Box>
    );
  },
);

export default PipelineAttributes;
