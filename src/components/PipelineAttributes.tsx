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

const pipelineAttributesToPipelineAttributesAndKeys = (
  pipelineAttributes: PipelineAttributesData,
): PipelineAttributesAndKeys => ({
  attributes: pipelineAttributes,
  stateKeys: Object.entries(pipelineAttributes.state).map(([k]) => k),
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

export interface PipelineAttributesRef {
  getPipelineAttributes: () => PipelineAttributesData;
}

export interface PipelineAttributesAndKeys {
  attributes: PipelineAttributesData;
  stateKeys: string[];
}

export interface PipelienAttributesProps {
  pipelineAttributes: PipelineAttributesData;
  onChange: () => void;
}

const PipelineAttributes = React.forwardRef(
  (
    { pipelineAttributes, onChange }: PipelienAttributesProps,
    ref: React.Ref<PipelineAttributesRef>,
  ) => {
    const [pipelineAttributesAndKeys, setPipelineAttributesAndKeys] =
      React.useState<PipelineAttributesAndKeys>(
        pipelineAttributesToPipelineAttributesAndKeys(pipelineAttributes),
      );

    const [stateOpened, setStateOpened] = React.useState(false);
    const [descriptionOpened, setDescriptionOpened] = React.useState(false);

    const rteRef = React.useRef<RichTextEditorRef>(null);

    const handleChangeState = (v: JsonObject, k?: string[]) => {
      setPipelineAttributesAndKeys({
        attributes: {
          ...pipelineAttributesAndKeys.attributes,
          state: v,
        },
        stateKeys: k ?? pipelineAttributesAndKeys.stateKeys,
      });
      onChange();
    };

    const handleStateToggle = () => {
      setStateOpened((prev) => !prev);
    };

    const handleDescriptionToggle = () => {
      setDescriptionOpened((prev) => !prev);
    };

    // effects

    React.useEffect(() => {
      setPipelineAttributesAndKeys(
        pipelineAttributesToPipelineAttributesAndKeys(pipelineAttributes),
      );
    }, [pipelineAttributes]);

    React.useEffect(() => {
      if (!rteRef.current?.editor) return;

      rteRef.current.editor.commands.setContent(pipelineAttributes.description);
    }, [pipelineAttributes.description]);

    // imperative

    React.useImperativeHandle(ref, () => ({
      getPipelineAttributes: () => {
        // lazy update description
        const description: string | null =
          rteRef.current?.editor?.storage.markdown.getMarkdown();

        if (description === null) {
          console.error('description is null');
          return pipelineAttributesAndKeys.attributes;
        }

        const updatedAttributes: PipelineAttributesData = {
          ...pipelineAttributesAndKeys.attributes,
          description,
        };

        return updatedAttributes;
      },
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
                value={pipelineAttributesAndKeys.attributes.state}
                onChange={(v, k) => handleChangeState(v as JsonObject, k)}
                objectKeys={pipelineAttributesAndKeys.stateKeys}
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
                content={pipelineAttributesAndKeys.attributes.description}
                onUpdate={onChange}
              />
            </Box>
          </Collapse>
        </Box>
      </Box>
    );
  },
);

export default PipelineAttributes;
