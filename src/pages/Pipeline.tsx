import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';
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
import {
  Pipeline as PipelineModel,
  getPipelines,
  postPipelineNew,
} from '../models/Pipeline';
import Chat from '../components/Chat';
import {
  ComponentInstance,
  getComponentInstance,
} from '../models/ComponentInstance';
import Prompt from '../components/Prompt';
import useComposerAxios from '../hooks/useComposerAxios';
import {
  PipelineSaveComponentInstance,
  PipelineSaveRequest,
  patchPipelineSave,
} from '../models/PipelineSave';
import {
  PipelineAttributes as PipelineAttributesModel,
  getPipelineAttributes,
} from '../models/PipelineAttributes';
import useQuery from '../hooks/useQuery';
import PipelineToolbar from '../components/PipelineToolbar';
import useLocalStorage from '../hooks/useLocalStorage';

const unsaveMessage =
  'You have unsaved changes. Are you sure you want to leave?';

const resizablePanelStyle = {
  margin: -1,
  padding: 1,
  height: 'calc(100% + 16px)',
  width: 'calc(100% + 16px)',
};

function Pipeline() {
  const theme = useTheme();
  const query = useQuery();
  const navigate = useNavigate();
  const { height: containerHeight } = useContainerDimensions();

  // local states
  const [editorHeight, setEditorHeight] = React.useState(0);

  // pipelines
  const [pipelines, setPipelines] = React.useState<PipelineModel[]>([]);

  // toolbar states
  const [saveState, setSaveState] = React.useState<
    'unsaved' | 'saved' | 'saving'
  >('unsaved');

  // inspect pipeline states
  const [components, setComponents] = React.useState<
    ComponentInstance[] | null
  >(null);
  const [pipelineId, setPipelineId] = React.useState<number | null>(null);

  const pipeline = React.useMemo(() => {
    if (pipelineId === null) {
      return null;
    }

    return pipelines?.find((p) => p.id === pipelineId) ?? null;
  }, [pipelines, pipelineId]);

  // pipeline editor states
  const [pipelineAttributes, setPipelineAttributes] =
    React.useState<PipelineAttributesModel | null>(null);
  const [componentId, setComponentId] = React.useState<number | null>(null);

  const component = React.useMemo(() => {
    if (componentId === null) {
      return null;
    }

    return components?.find((c) => c.id === componentId) ?? null;
  }, [components, componentId]);

  // chat states
  const [markdown, setMarkdown] = useLocalStorage('Pipeline:markdown', true);

  // panels refs
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const inspectPipelineRef = React.useRef<InspectPipelineRef>(null);
  const pipelineEditorRef = React.useRef<PipelineEditorRef>(null);

  // save pipeline
  const pipelineSaveClient = useComposerAxios<{}, PipelineSaveRequest>();

  const syncPipelineSave = React.useCallback(() => {
    if (
      pipelineEditorRef.current === null ||
      inspectPipelineRef.current === null ||
      pipeline === null
    ) {
      console.error(
        'Saving without pipeline editor, inspect pipeline, or pipeline',
      );
      return;
    }

    setSaveState('saving');
    const newComponents: ComponentInstance[] = updateComponents();
    const newPipelines: PipelineModel[] = updatePipelines();
    const newPipelineAttributes: PipelineAttributesModel =
      updatePipelineAttributes();

    if (pipelineId === null) {
      console.error('Saving without pipeline id');
      return;
    }

    const newPipeline = newPipelines.find((p) => p.id === pipelineId);

    if (newPipeline === undefined) {
      console.error('Saving without pipeline');
      return;
    }

    const pipelineSaveRequest: PipelineSaveRequest = {
      name: newPipeline.name,
      response: newPipelineAttributes.response,
      state: newPipelineAttributes.state,
      description: newPipelineAttributes.description,
      components: newComponents.map(
        (c: ComponentInstance): PipelineSaveComponentInstance => ({
          id: c.id,
          order: c.order,
          is_enabled: c.is_enabled,
          function_name: c.function_name,
          name: c.name,
          arguments: c.arguments,
          return_type: c.return_type,
          description: c.description,
          code: c.code,
          state: c.state,
        }),
      ),
    };

    pipelineSaveClient.sendRequest(
      patchPipelineSave(pipeline.id, pipelineSaveRequest),
    );
  }, [pipeline, pipelineSaveClient]);

  React.useEffect(() => {
    if (!pipelineSaveClient.response) return;
    setSaveState('saved');
  }, [pipelineSaveClient.response]);

  React.useEffect(() => {
    if (!pipelineSaveClient.error) return;
    console.error(pipelineSaveClient.error);
  }, [pipelineSaveClient.error]);

  // new pipeline
  const pipelineNewClient = useComposerAxios<PipelineModel[]>(
    postPipelineNew(),
  );

  const syncPipelineNew = React.useCallback(() => {
    pipelineNewClient.sendRequest();
  }, [pipelineNewClient]);

  React.useEffect(() => {
    if (!pipelineNewClient.response) return;
    setPipelines(pipelines.concat(pipelineNewClient.response.data));
  }, [pipelineNewClient.response]);

  React.useEffect(() => {
    if (!pipelineNewClient.error) return;
    console.error(pipelineNewClient.error);
  }, [pipelineNewClient.error]);

  // pipeline component instance
  const pipelineComponentInstanceClient =
    useComposerAxios<ComponentInstance[]>();

  const syncPipelineComponentInstance = React.useCallback(
    (id: number) => {
      pipelineComponentInstanceClient.sendRequest(getComponentInstance(id));
    },
    [pipelineComponentInstanceClient],
  );

  React.useEffect(() => {
    if (!pipelineComponentInstanceClient.response) {
      return;
    }

    setComponents(pipelineComponentInstanceClient.response.data);
  }, [pipelineComponentInstanceClient.response]);

  React.useEffect(() => {
    if (!pipelineComponentInstanceClient.error) {
      return;
    }

    console.error(pipelineComponentInstanceClient.error);
  }, [pipelineComponentInstanceClient.error]);

  // pipelines
  const pipelinesClient = useComposerAxios<PipelineModel[]>();

  const syncPipelines = React.useCallback(() => {
    pipelinesClient.sendRequest(getPipelines());
  }, [pipelinesClient]);

  React.useEffect(() => {
    if (!pipelinesClient.response) {
      return;
    }

    setPipelines(pipelinesClient.response.data);
  }, [pipelinesClient.response]);

  React.useEffect(() => {
    if (!pipelinesClient.error) {
      return;
    }

    console.error(pipelinesClient.error);
  }, [pipelinesClient.error]);

  // pipeline attributes
  const pipelineAttributesClient = useComposerAxios<PipelineAttributesModel>();

  const syncPipelineAttributes = React.useCallback(
    (id: number) => {
      pipelineAttributesClient.sendRequest(getPipelineAttributes(id));
    },
    [pipelineAttributesClient],
  );

  React.useEffect(() => {
    if (!pipelineAttributesClient.response) {
      return;
    }

    setPipelineAttributes(pipelineAttributesClient.response.data);
  }, [pipelineAttributesClient.response]);

  React.useEffect(() => {
    if (!pipelineAttributesClient.error) {
      return;
    }

    console.error(pipelineAttributesClient.error);
  }, [pipelineAttributesClient.error]);

  // routes
  React.useEffect(() => {
    if (query.get('pipeline') !== null) {
      const pipelineId = parseInt(query.get('pipeline')!, 10);

      syncPipelines();
      setPipelineId(pipelineId);
      syncPipelineComponentInstance(pipelineId);
      syncPipelineAttributes(pipelineId);
      setComponentId(null);
      setSaveState('saved');
    } else {
      syncPipelines();
      setPipelineId(null);
      setComponents(null);
      setPipelineAttributes(null);
      setComponentId(null);
    }
  }, [query]);

  // updators

  const updatePipelines = React.useCallback((): PipelineModel[] => {
    const newPipeline: PipelineModel | null =
      inspectPipelineRef.current?.getPipeline() ?? null;

    if (newPipeline === null) {
      return pipelines;
    }

    const newPipelines: PipelineModel[] = pipelines.map((p) => {
      if (p.id === newPipeline?.id) {
        return newPipeline;
      }

      return p;
    });

    setPipelines(newPipelines);
    return newPipelines;
  }, [pipelines, pipeline]);

  const updatePipelineAttributes =
    React.useCallback((): PipelineAttributesModel => {
      const newPipelineAttributes: PipelineAttributesModel | null =
        pipelineEditorRef.current?.getPipelineAttributes() ?? null;

      if (newPipelineAttributes === null) {
        if (pipelineAttributes === null) {
          console.error('Pipeline attributes is null');
          navigate('/pipeline');
          return {
            response: '',
            state: {},
            description: '',
          };
        }
        return pipelineAttributes;
      }

      setPipelineAttributes(newPipelineAttributes);
      return newPipelineAttributes;
    }, [pipelineAttributes]);

  const updateComponents = React.useCallback(() => {
    let newComponents: ComponentInstance[] | null =
      inspectPipelineRef.current?.getComponents() ?? null;
    const newComponent: ComponentInstance | null =
      pipelineEditorRef.current?.getComponent() ?? null;

    if (newComponents === null) {
      if (components === null) {
        console.error('Components is null');
        navigate('/pipeline');
        return [];
      }

      newComponents = components;
    }

    if (newComponent != null) {
      newComponents = newComponents.map((c) => {
        if (c.id === newComponent.id) {
          return newComponent;
        }

        return c;
      });
    }

    setComponents(newComponents);
    return newComponents;
  }, [components, component]);

  // trivial handlers

  const handleUnsave = React.useCallback(() => {
    setSaveState('unsaved');
  }, []);

  const handleMarkdownToggle = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMarkdown(e.target.checked);
    },
    [],
  );

  // pipelines handlers

  const handlePipelineSelect = React.useCallback((id: number) => {
    navigate(`/pipeline?pipeline=${id}`);
  }, []);

  const handlePipelineRename = React.useCallback((id: number, name: string) => {
    setPipelines((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            name,
          };
        }

        return p;
      }),
    );
  }, []);

  const handlePipelineNewClick = React.useCallback(() => {
    syncPipelineNew();
  }, [syncPipelineNew]);

  const handlePipelineDeleteClick = React.useCallback((id: number) => {
    setPipelines((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // toolbar handlers

  const handlePipelineBack = React.useCallback(() => {
    navigate('/pipeline');
  }, [saveState]);

  const handleSave = React.useCallback(() => {
    syncPipelineSave();
  }, [syncPipelineSave]);

  // inspect pipeline handlers

  const handlePipelineChange = React.useCallback(() => {
    handleUnsave();
  }, []);

  const handleComponentsChange = React.useCallback(() => {
    handleUnsave();
  }, []);

  const handleComponentSelect = React.useCallback(
    (id: number | null) => {
      // update the component first, then set the new component id
      if (componentId === null) {
        updatePipelineAttributes();
      } else {
        updateComponents();
      }
      setComponentId(id);
    },
    [componentId],
  );

  const handleComponentEnableToggle = React.useCallback(() => {
    handleUnsave();
  }, []);

  const handleComponentNewClick = React.useCallback(
    (component: ComponentInstance) => {
      if (components === null) {
        console.error('Component new without components');
        return;
      }

      setComponents([...components, component]);
      setComponentId(null);
    },
    [components],
  );

  const handleComponentDeleteClick = React.useCallback(
    (id: number) => {
      if (components === null) {
        console.error('Component delete without components');
        return;
      }

      const updatedComponents = components.filter((c) => c.id !== id);
      const orderedComponents = updatedComponents.map((c, i) => ({
        ...c,
        order: i,
      }));

      setComponents(orderedComponents);

      if (componentId === id) {
        setComponentId(null);
      }

      handleUnsave();
    },
    [components],
  );

  // pipeline editor handlers

  const handleComponentChange = React.useCallback(() => {
    handleUnsave();
  }, []);

  const handlePipelineAttributesChange = React.useCallback(() => {
    handleUnsave();
  }, []);

  // chat handlers

  const handleChatSend = React.useCallback(() => {
    if (!pipeline) {
      console.error('Chat send without pipeline');
      return;
    }

    console.log('chat send');
  }, [pipeline]);

  const handleChatReceive = React.useCallback(() => {
    if (!pipelineId) {
      return;
    }

    syncPipelineAttributes(pipelineId);
    syncPipelineComponentInstance(pipelineId!);
    console.log('chat receive');
  }, [pipelineId]);

  // effects

  React.useLayoutEffect(() => {
    if (pipeline) {
      setEditorHeight(
        containerHeight -
          toolbarRef.current!.getBoundingClientRect().height -
          8,
      );
    } else {
      setEditorHeight(0);
    }
  }, [pipeline, containerHeight]);

  // components

  const pipelinesPanel = React.useMemo(
    () => (
      <Panel
        title="Pipeline"
        titleSx={{ px: 3 }}
        sx={{
          width: pipeline ? undefined : 500,
          height: pipeline ? editorHeight : 'fit-content',
          px: 0,
        }}
        wrapper={<Box display="flex" flexDirection="column" maxHeight="100%" />}
        trailing={
          !pipeline ? (
            <Tooltip title="New" placement="top">
              <IconButton edge="end" onClick={handlePipelineNewClick}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
          ) : undefined
        }
      >
        {pipeline && components ? (
          <InspectPipeline
            ref={inspectPipelineRef}
            pipeline={pipeline}
            components={components}
            component={component}
            onPipelineChange={handlePipelineChange}
            onComponentsChange={handleComponentsChange}
            onComponentSelect={handleComponentSelect}
            onComponentEnableToggle={handleComponentEnableToggle}
            onComponentNew={handleComponentNewClick}
            onComponentDelete={handleComponentDeleteClick}
          />
        ) : (
          <PipelineList
            pipelines={pipelines}
            onPipelineSelect={handlePipelineSelect}
            onPipelineRename={handlePipelineRename}
            onPipelineDelete={handlePipelineDeleteClick}
          />
        )}
      </Panel>
    ),
    [
      pipeline,
      components,
      component,
      pipelines,
      handlePipelineNewClick,
      handlePipelineSelect,
      handlePipelineRename,
      handlePipelineDeleteClick,
      handlePipelineChange,
      handleComponentsChange,
      handleComponentSelect,
      handleComponentEnableToggle,
      handleComponentNewClick,
      handleComponentDeleteClick,
    ],
  );

  const toolbarComponent = React.useMemo(
    () => (
      <Panel paperRef={toolbarRef} sx={{ p: 1 }}>
        <PipelineToolbar
          pipeline={pipeline}
          saveState={saveState}
          onPipelineBack={handlePipelineBack}
          onSave={handleSave}
        />
      </Panel>
    ),
    [pipeline, saveState, handlePipelineBack, handleSave],
  );

  const dividerComponent = React.useMemo(
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
    [],
  );

  const pipelineEditorComponent = React.useMemo(
    () => (
      <>
        <ResizablePanel
          id="editor"
          order={2}
          collapsible
          style={resizablePanelStyle}
        >
          <Panel
            title={
              component ? 'Component Editor' : 'Pipeline Attributes Editor'
            }
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
              pipelineAttributes={pipelineAttributes}
              markdown={markdown}
              component={component}
              onComponentChange={handleComponentChange}
              onPipelineAttributesChange={handlePipelineAttributesChange}
            />
          </Panel>
        </ResizablePanel>
        {dividerComponent}
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
            trailing={
              <Box display="flex" flexDirection="row" alignItems="center">
                <Box height={1} overflow="visible">
                  <Switch checked={markdown} onChange={handleMarkdownToggle} />
                </Box>
                <Typography>Markdown</Typography>
              </Box>
            }
          >
            <Chat
              pipeline={pipeline!}
              markdown={markdown}
              onChatSend={handleChatSend}
              onChatReceive={handleChatReceive}
            />
          </Panel>
        </ResizablePanel>
      </>
    ),
    [
      component,
      markdown,
      pipeline,
      pipelineAttributes,
      editorHeight,
      handleComponentChange,
      handlePipelineAttributesChange,
      handleMarkdownToggle,
      handleChatSend,
      handleChatReceive,
    ],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={pipeline ? containerHeight : undefined}
      gap={1}
    >
      {pipeline && toolbarComponent}
      <Prompt
        when={pipeline !== null && saveState === 'unsaved'}
        message={unsaveMessage}
        beforeUnload
      />
      {pipeline ? (
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
            {pipelinesPanel}
          </ResizablePanel>
          {dividerComponent}
          {pipelineEditorComponent}
        </PanelGroup>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
        >
          {pipelineNewClient.loading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
              maxWidth="500px"
            >
              <CircularProgress />
              <Typography>
                Please wait while we create a container for you...
              </Typography>
              <Typography>This may take up to 20 seconds.</Typography>
            </Box>
          ) : (
            pipelinesPanel
          )}
        </Box>
      )}
    </Box>
  );
}

export default Pipeline;
