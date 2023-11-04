import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import useTheme from '@mui/material/styles/useTheme';
import Tooltip from '@mui/material/Tooltip';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Panel from '../components/Panel';
import PipelineList from '../components/PipelineList';
import InspectPipeline, {
  InspectPipelineRef,
} from '../components/InspectPipeline';
import PipelineEditor, {
  PipelineEditorRef,
} from '../components/PipelineEditor';
import useContainerDimensions from '../hooks/useContainerDimensions';
import useKey from '../hooks/useKey';
import { Pipeline as PipelineModel, postPipelineNew } from '../models/Pipeline';
import Chat from '../components/Chat';
import {
  ComponentInstance,
  getComponentInstance,
} from '../models/ComponentInstance';
import Prompt from '../components/Prompt';
import { JsonObject } from '../utils/JsonObject';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  PipelineSaveComponentInstance,
  PipelineSaveRequest,
  patchPipelineSave,
} from '../models/PipelineSave';

const unsaveMessage =
  'You have unsaved changes. Are you sure you want to leave?';

function Pipeline() {
  const theme = useTheme();
  const { height: containerHeight } = useContainerDimensions();
  const [pipelineOpened, setPipelineOpened] = React.useState(false);
  const [pipeline, setPipeline] = React.useState<PipelineModel | null>(null);
  const [componentId, setComponentId] = React.useState<number | null>(null);
  const [components, setComponents] = React.useState<ComponentInstance[]>([]);
  const [mode, setMode] = React.useState<'code' | 'attr' | null>(null);
  const [editorHeight, setEditorHeight] = React.useState(0);
  const [saved, setSaved] = React.useState(true);

  const saveRippleRef = React.useRef<any>(null);
  const saveButtonRef = React.useRef<any>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const inspectPipelineRef = React.useRef<InspectPipelineRef>(null);
  const pipelineEditorRef = React.useRef<PipelineEditorRef>(null);

  const pipelineNewClient = useComposerAxios<PipelineModel>(postPipelineNew());
  const pipelineComponentInstanceClient =
    useComposerAxios<ComponentInstance[]>();
  const pipelineSaveClient = useComposerAxios<{}, PipelineSaveRequest>();

  React.useEffect(() => {
    if (pipeline) {
      setPipelineOpened(true);
      pipelineComponentInstanceClient.sendRequest(
        getComponentInstance(pipeline.id),
      );
    } else {
      setPipelineOpened(false);
      setMode(null);
      setComponentId(null);
      setComponents([]);
      setSaved(true);
    }
  }, [pipeline]);

  React.useEffect(() => {
    if (!pipelineComponentInstanceClient.response) return;

    const componentInstance = pipelineComponentInstanceClient.response.data;
    setComponents(componentInstance);
  }, [pipelineComponentInstanceClient.response]);

  const handlePipelineBack = () => {
    if (pipelineOpened && !saved) {
      if (!window.confirm(unsaveMessage)) {
        return;
      }
    }

    setPipelineOpened(false);
    setPipeline(null);
  };

  const handlePipelineNew = () => {
    pipelineNewClient.sendRequest();
  };

  React.useEffect(() => {
    if (!pipelineNewClient.response) return;

    setPipeline(pipelineNewClient.response.data);
  }, [pipelineNewClient.response]);

  const handleSave = () => {
    if (saved) {
      return;
    }

    if (
      pipelineEditorRef.current === null ||
      inspectPipelineRef.current === null ||
      pipeline === null
    ) {
      console.error('Pipeline editor or pipeline is null');
      return;
    }

    pipelineEditorRef.current.setIsSaving(true);
    const newComps = updateComponentsFromEditor();

    const pipelineSaveRequest: PipelineSaveRequest = {
      name: inspectPipelineRef.current.getPipelineName(),
      components: newComps.map(
        (c: ComponentInstance): PipelineSaveComponentInstance => ({
          id: c.id,
          order: c.order,
          is_enabled: c.is_enabled,
          name: c.name,
          function_name: c.function_name,
          description: c.description,
          code: c.code,
          state: c.state,
        }),
      ),
    };

    pipelineSaveClient.sendRequest(
      patchPipelineSave(pipeline.id, pipelineSaveRequest),
    );
  };

  React.useEffect(() => {
    if (!pipelineSaveClient.response) return;
    setSaved(true);
  }, [pipelineSaveClient.response]);

  React.useEffect(() => {
    if (!pipelineSaveClient.error) return;
    console.error(pipelineSaveClient.error);
  }, [pipelineSaveClient.error]);

  const component = React.useMemo(
    () =>
      componentId !== null
        ? components.find((c) => c.id === componentId) ?? null
        : null,
    [components, componentId],
  );

  const handleUnsave = () => {
    setSaved(false);
  };

  const handleSetComponentsUnsave = (c: ComponentInstance[]) => {
    setComponents(c);
    handleUnsave();
  };

  const updateComponentsFromEditor = () => {
    if (componentId === null) {
      return [];
    }

    const currComp = components.find((c) => c.id === componentId);

    if (!currComp) {
      return [];
    }

    const newComps = components.map((comp) => {
      if (comp.id === currComp.id) {
        const editorUpdate: {
          name?: string;
          functionName?: string;
          description?: string;
          code?: string;
          state?: JsonObject;
        } = {};
        if (pipelineEditorRef.current?.getName() !== undefined) {
          editorUpdate.name = pipelineEditorRef.current?.getName();
        }
        if (pipelineEditorRef.current?.getFunctionName() !== undefined) {
          editorUpdate.functionName =
            pipelineEditorRef.current?.getFunctionName();
        }
        if (pipelineEditorRef.current?.getDescription() !== undefined) {
          editorUpdate.description =
            pipelineEditorRef.current?.getDescription();
        }
        if (pipelineEditorRef.current?.getCode() !== undefined) {
          editorUpdate.code = pipelineEditorRef.current?.getCode();
        }
        if (pipelineEditorRef.current?.getState() !== undefined) {
          editorUpdate.state = pipelineEditorRef.current?.getState();
        }

        return {
          ...comp,
          ...editorUpdate,
        } as ComponentInstance;
      }

      return comp;
    });

    setComponents(newComps);

    return newComps;
  };

  const handleSetComponent = (c: ComponentInstance | null) => {
    if (componentId !== null && c) {
      updateComponentsFromEditor();
    }
    setComponentId(c?.id ?? null);
    // No need to unsave because this is only called when component is selected
  };

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
    handleSave();
  });

  const toolbar = (
    <Panel paperRef={toolbarRef} sx={{ p: 1 }}>
      <Box display="flex" flexDirection="row">
        <Tooltip title="Back" placement="top">
          <IconButton
            onClick={handlePipelineBack}
            sx={{
              visibility: pipelineOpened ? 'visible' : 'hidden',
              opacity: pipelineOpened ? 1 : 0,
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
              color={saved ? 'primary' : 'default'}
              onClick={handleSave}
            >
              <SaveIcon />
              <TouchRipple ref={saveRippleRef} center />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>
    </Panel>
  );

  React.useLayoutEffect(() => {
    if (pipelineOpened) {
      setEditorHeight(
        containerHeight -
          toolbarRef.current!.getBoundingClientRect().height -
          8,
      );
    } else {
      setEditorHeight(0);
    }
  }, [pipelineOpened, containerHeight]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={pipelineOpened ? containerHeight : undefined}
      gap={1}
    >
      {pipelineOpened && toolbar}
      <Prompt
        when={pipelineOpened && !saved}
        message={unsaveMessage}
        beforeUnload
      />
      {React.useMemo(
        () => (
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            width="100%"
            height="100%"
            gap={1}
          >
            <Panel
              title="Pipeline"
              titleSx={{ px: 3, flexShrink: 1 }}
              sx={{
                width: pipelineOpened ? '30%' : 500,
                height: pipelineOpened ? editorHeight : 'fit-content',
                px: 0,
              }}
              wrapper={
                <Box display="flex" flexDirection="column" maxHeight="100%" />
              }
              trailing={
                !pipelineOpened ? (
                  <Tooltip title="New" placement="top">
                    <IconButton edge="end" onClick={handlePipelineNew}>
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                ) : undefined
              }
            >
              {pipelineOpened && pipeline ? (
                <InspectPipeline
                  ref={inspectPipelineRef}
                  pipeline={pipeline}
                  components={components}
                  setComponents={handleSetComponentsUnsave}
                  component={component}
                  setComponent={handleSetComponent}
                  setMode={setMode}
                  onUnsave={handleUnsave}
                />
              ) : (
                <PipelineList setPipeline={setPipeline} />
              )}
            </Panel>
            {pipelineOpened && pipeline && (
              <>
                <PipelineEditor
                  ref={pipelineEditorRef}
                  height={editorHeight}
                  component={component}
                  mode={mode}
                  onUnsave={handleUnsave}
                />
                <Chat pipeline={pipeline} height={editorHeight} />
              </>
            )}
          </Box>
        ),
        [pipelineOpened, pipeline, components, component, mode, editorHeight],
      )}
    </Box>
  );
}

export default Pipeline;
