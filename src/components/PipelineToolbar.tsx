import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { AxiosResponse } from 'axios';
import { Pipeline } from '../models/Pipeline';
import useKey from '../hooks/useKey';
import ApiIntegration from './ApiIntegration';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  ArchiveType,
  getPipelineDownload,
  mimeToExt,
} from '../models/PipelineDownload';

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
  const [apiIntegrationOpen, setApiIntegrationOpen] = React.useState(false);
  const [downloadMenuAnchor, setDownloadMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const saveRippleRef = React.useRef<any>(null);
  const saveButtonRef = React.useRef<any>(null);

  const getPipelineDownloadClient = useComposerAxios();

  React.useEffect(() => {
    if (!getPipelineDownloadClient.response || !pipeline) return;

    const res = getPipelineDownloadClient.response as AxiosResponse;
    const ext = mimeToExt(res.headers['content-type']);
    const filename = `pipeline_${pipeline.id}.${ext}`;
    const link = document.createElement('a');
    link.target = '_blank';
    link.download = filename;
    link.href = URL.createObjectURL(new Blob([res.data], { type: 'file' }));
    link.click();
    getPipelineDownloadClient.setResponse(null);
  }, [getPipelineDownloadClient.response]);

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

  const handleApiInstructionClick = () => {
    setApiIntegrationOpen(true);
  };

  const handleApiIntegrationClose = () => {
    setApiIntegrationOpen(false);
  };

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDownloadMenuAnchor(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setDownloadMenuAnchor(null);
  };

  const handleDownload = (archive_type: ArchiveType) => () => {
    setDownloadMenuAnchor(null);
    if (!pipeline) {
      console.error('pipeline is null');
      return;
    }

    getPipelineDownloadClient.sendRequest(
      getPipelineDownload(pipeline.id, archive_type),
    );
  };

  return (
    <>
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
        <Tooltip title="Download" placement="top">
          <Box>
            <IconButton color="primary" onClick={handleDownloadClick}>
              <DownloadIcon />
            </IconButton>
          </Box>
        </Tooltip>
        <Menu
          anchorEl={downloadMenuAnchor}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={Boolean(downloadMenuAnchor)}
          onClose={handleDownloadClose}
        >
          <MenuItem onClick={handleDownload(ArchiveType.TARGZ)}>
            .tar.gz
          </MenuItem>
          <MenuItem onClick={handleDownload(ArchiveType.ZIP)}>.zip</MenuItem>
        </Menu>
        <Tooltip title="API Integration" placement="top">
          <Box>
            <IconButton color="primary" onClick={handleApiInstructionClick}>
              <IntegrationInstructionsIcon />
            </IconButton>
          </Box>
        </Tooltip>
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
      <ApiIntegration
        pipelineId={pipeline!.id}
        open={apiIntegrationOpen}
        onClose={handleApiIntegrationClose}
      />
    </>
  );
}

export default PipelineToolbar;
