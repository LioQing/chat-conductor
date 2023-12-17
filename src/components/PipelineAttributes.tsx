import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { RichTextEditorRef } from 'mui-tiptap';
import MarkdownEditor from './MarkdownEditor';
import JsonEditor, { JsonTextField } from './JsonEditor';
import { JsonObject } from '../utils/JsonObject';
import { PipelineAttributes as PipelineAttributesData } from '../models/PipelineAttributes';
import useLocalStorage from '../hooks/useLocalStorage';

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
  markdown: boolean;
  onChange: () => void;
}

const PipelineAttributes = React.forwardRef(
  (
    { pipelineAttributes, markdown, onChange }: PipelienAttributesProps,
    ref: React.Ref<PipelineAttributesRef>,
  ) => {
    const [openedSections, setOpenedSections] = useLocalStorage<string[]>(
      'PipelineAttributes:openedSections',
      [],
    );

    const [pipelineAttributesAndKeys, setPipelineAttributesAndKeys] =
      React.useState<PipelineAttributesAndKeys>(
        pipelineAttributesToPipelineAttributesAndKeys(pipelineAttributes),
      );

    const [responseOpened, setResponseOpened] = React.useState(
      openedSections.includes('response'),
    );
    const [stateOpened, setStateOpened] = React.useState(
      openedSections.includes('state'),
    );
    const [descriptionOpened, setDescriptionOpened] = React.useState(
      openedSections.includes('description'),
    );

    const rteRef = React.useRef<RichTextEditorRef>(null);

    const handleChangeResponse = (v: string) => {
      setPipelineAttributesAndKeys({
        attributes: {
          ...pipelineAttributesAndKeys.attributes,
          response: v,
        },
        stateKeys: pipelineAttributesAndKeys.stateKeys,
      });
      onChange();
    };

    const handleChangeState = (v: JsonObject, k?: string[]) => {
      if (k === undefined) {
        console.error('k is undefined');
        return;
      }

      setPipelineAttributesAndKeys({
        attributes: {
          ...pipelineAttributesAndKeys.attributes,
          state: v,
        },
        stateKeys: k,
      });
      onChange();
    };

    const handleChangeDescription = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      setPipelineAttributesAndKeys({
        attributes: {
          ...pipelineAttributesAndKeys.attributes,
          description: e.target.value,
        },
        stateKeys: pipelineAttributesAndKeys.stateKeys,
      });
      onChange();
    };

    const handleResponseToggle = () => {
      setResponseOpened((prev) => !prev);
    };

    const handleStateToggle = () => {
      setStateOpened((prev) => !prev);
    };

    const handleDescriptionToggle = () => {
      setDescriptionOpened((prev) => !prev);
    };

    // effects

    React.useEffect(() => {
      const newOpenedSections = [];
      if (responseOpened) newOpenedSections.push('response');
      if (stateOpened) newOpenedSections.push('state');
      if (descriptionOpened) newOpenedSections.push('description');
      setOpenedSections(newOpenedSections);
    }, [responseOpened, stateOpened, descriptionOpened]);

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
          rteRef.current?.editor?.storage.markdown.getMarkdown() ??
          pipelineAttributesAndKeys.attributes.description ??
          null;

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
          <ButtonBase onClick={handleResponseToggle} sx={buttonBaseSx}>
            <Typography variant="h6">Response</Typography>
            <Box flexGrow={1} />
            {responseOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ButtonBase>
          <Collapse in={responseOpened}>
            <Box sx={{ overflowX: 'auto' }} my={1}>
              <JsonTextField
                value={pipelineAttributesAndKeys.attributes.response}
                onChange={handleChangeResponse}
                inputProps={{
                  placeholder: 'Interpolated',
                  sx: {
                    width: '100%',
                  },
                }}
              />
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
                value={pipelineAttributesAndKeys.attributes.state}
                onChange={(v, c, k) => handleChangeState(v as JsonObject, k)}
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
              {markdown ? (
                <MarkdownEditor
                  ref={rteRef}
                  content={pipelineAttributesAndKeys.attributes.description}
                  onUpdate={onChange}
                />
              ) : (
                <TextField
                  value={pipelineAttributesAndKeys.attributes.description}
                  onChange={handleChangeDescription}
                  variant="outlined"
                  fullWidth
                  multiline
                />
              )}
            </Box>
          </Collapse>
        </Box>
      </Box>
    );
  },
);

export default PipelineAttributes;
