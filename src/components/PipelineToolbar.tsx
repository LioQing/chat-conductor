import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { useTheme } from '@mui/material/styles';
import { Pipeline } from '../models/Pipeline';
import useKey from '../hooks/useKey';

export interface PipelineToolbarProps {
  pipeline: Pipeline | null;
  saveState: 'saved' | 'unsaved' | 'saving';
  onPipelineBack: () => void;
  onSave: () => void;
}

function PipelineToolbar({
  pipeline,
  saveState,
  onPipelineBack,
  onSave,
}: PipelineToolbarProps) {
  const theme = useTheme();
  const saveRippleRef = React.useRef<any>(null);
  const saveButtonRef = React.useRef<any>(null);

  useKey('ctrls', (e: KeyboardEvent) => {
    e.preventDefault();
    const rect = saveButtonRef.current?.getBoundingClientRect();
    saveRippleRef.current?.start(
      {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      },
      // when center is true, the ripple doesn't travel to the border of the container
      { center: false },
    );
    setTimeout(() => saveRippleRef.current.stop({}), 80);
    onSave();
  });

  return (
    <Box display="flex" flexDirection="row">
      <Tooltip title="Back" placement="top">
        <IconButton
          onClick={onPipelineBack}
          sx={{
            visibility: pipeline ? 'visible' : 'hidden',
            opacity: pipeline ? 1 : 0,
            transition: theme.transitions.create('all'),
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <Box flexGrow={1} />
      <Tooltip title="Save" placement="top">
        <Box>
          <IconButton
            ref={saveButtonRef}
            color={saveState === 'saved' ? 'primary' : 'default'}
            onClick={onSave}
          >
            <SaveIcon />
            <TouchRipple ref={saveRippleRef} center />
          </IconButton>
        </Box>
      </Tooltip>
    </Box>
  );
}

export default PipelineToolbar;
