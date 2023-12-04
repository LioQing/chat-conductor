import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import useTheme from '@mui/material/styles/useTheme';
import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import Divider from '@mui/material/Divider';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {
  PanelGroup,
  Panel as ResizablePanel,
  PanelResizeHandle,
} from 'react-resizable-panels';
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
  const history = React.useMemo(() => window.history, []);
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
      history.pushState(null, '', `/pipeline/?pipeline=${pipeline.id}`);
    } else {
      setPipelineOpened(false);
      setMode(null);
      setComponentId(null);
      setComponents([]);
      setSaved(true);
      history.pushState(null, '', `/pipeline/`);
    }
  }, [pipeline]);

  React.useEffect(() => {
    if (!pipelineComponentInstanceClient.response) {
      return;
    }

    const componentInstance = pipelineComponentInstanceClient.response.data;
    setComponents(componentInstance);
  }, [pipelineComponentInstanceClient.response]);

  const handlePipelineRun = React.useCallback(() => {
    if (!pipeline) return;

    pipelineEditorRef.current?.setIsRunning(true);
    pipelineComponentInstanceClient.sendRequest(
      getComponentInstance(pipeline.id),
    );
    inspectPipelineRef.current?.onRun();
  }, [pipelineComponentInstanceClient, pipeline]);

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

    const pstate = inspectPipelineRef.current.getPipelineState();
    if (pstate === null) {
      console.error('Pipeline state is null');
      return;
    }

    const pipelineSaveRequest: PipelineSaveRequest = {
      name: inspectPipelineRef.current.getPipelineName(),
      state: pstate,
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
          function_name?: string;
          description?: JsonObject;
          code?: string;
          state?: JsonObject;
        } = {};
        if (pipelineEditorRef.current?.getName() !== undefined) {
          editorUpdate.name = pipelineEditorRef.current?.getName();
        }
        if (pipelineEditorRef.current?.getFunctionName() !== undefined) {
          editorUpdate.function_name =
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

  const editorTitle = React.useMemo(() => {
    if (mode === 'code') {
      return 'Code';
    }

    if (mode === 'attr') {
      return 'Attributes';
    }

    return 'Nothing is selected';
  }, [mode]);

  const divider = React.useMemo(
    () => (
      <PanelResizeHandle>
        <Box
          p={0.5}
          height="100%"
          sx={{
            '> *': {
              backgroundColor: alpha(
                theme.palette.divider,
                theme.palette.action.focusOpacity,
              ),
            },
            '&:hover': {
              '> *': {
                backgroundColor: alpha(
                  theme.palette.divider,
                  theme.palette.action.focusOpacity * 1.5,
                ),
              },
            },
            '&:active': {
              '> *': {
                backgroundColor: alpha(
                  theme.palette.divider,
                  theme.palette.action.disabledOpacity,
                ),
              },
            },
          }}
        >
          <Divider orientation="vertical" />
        </Box>
      </PanelResizeHandle>
    ),
    [theme],
  );

  const resizablePanelStyle = {
    margin: -1,
    padding: 1,
    height: 'calc(100% + 16px)',
    width: 'calc(100% + 16px)',
  };

  const editorComponents = React.useMemo(
    () => (
      <>
        <ResizablePanel
          id="editor"
          order={2}
          collapsible
          style={resizablePanelStyle}
        >
          <Panel
            title={editorTitle}
            titleSx={{ mx: 3 }}
            wrapper={
              <Box
                display="flex"
                flexDirection="column"
                height={editorHeight - 24 - 8}
              />
            }
            sx={{ px: 0, height: editorHeight }}
          >
            <PipelineEditor
              ref={pipelineEditorRef}
              component={component}
              mode={mode}
              onUnsave={handleUnsave}
            />
          </Panel>
        </ResizablePanel>
        {divider}
        <ResizablePanel
          id="chat"
          order={3}
          collapsible
          style={resizablePanelStyle}
        >
          <Panel
            title="Chat"
            sx={{ height: editorHeight }}
            wrapper={
              <Box display="flex" flexDirection="column" height="100%" />
            }
          >
            <Chat pipeline={pipeline!} onPipelineRun={handlePipelineRun} />
          </Panel>
        </ResizablePanel>
      </>
    ),
    [pipelineOpened, pipeline, components, component, mode, editorHeight],
  );

  const pipelineListPanel = React.useMemo(
    () => (
      <Panel
        title="Pipeline"
        titleSx={{ px: 3 }}
        sx={{
          width: pipelineOpened ? undefined : 500,
          height: pipelineOpened ? editorHeight : 'fit-content',
          px: 0,
        }}
        wrapper={<Box display="flex" flexDirection="column" maxHeight="100%" />}
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
    ),
    [pipelineOpened, pipeline, components, component, mode, editorHeight],
  );

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
        () =>
          pipelineOpened && pipeline ? (
            <PanelGroup
              direction="horizontal"
              autoSaveId="editor-panel-group"
              style={{ overflow: 'visible' }}
            >
              <ResizablePanel
                id="pipeline-list"
                order={1}
                collapsible
                style={resizablePanelStyle}
              >
                {pipelineListPanel}
              </ResizablePanel>
              {divider}
              {editorComponents}
            </PanelGroup>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="100%"
              height="100%"
            >
              {pipelineListPanel}
            </Box>
          ),
        [pipelineOpened, pipeline, components, component, mode, editorHeight],
      )}
    </Box>
  );
}

export default Pipeline;
