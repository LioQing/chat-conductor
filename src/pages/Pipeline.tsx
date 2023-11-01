import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import useTheme from '@mui/material/styles/useTheme';
import Tooltip from '@mui/material/Tooltip';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
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
import PipelineModel from '../models/Pipeline';
import Chat from '../components/Chat';
import ComponentInstance from '../models/ComponentInstance';
import Prompt from '../components/Prompt';
import { JsonObject } from '../utils/JsonObject';

const unsaveMessage =
  'You have unsaved changes. Are you sure you want to leave?';

function Pipeline() {
  const theme = useTheme();
  const { height: containerHeight } = useContainerDimensions();
  const [pipelineOpened, setPipelineOpened] = React.useState(false);
  const [pipeline, setPipeline] = React.useState<PipelineModel | null>(null);
  const [componentOrder, setComponentOrder] = React.useState<number | null>(
    null,
  );
  const [components, setComponents] = React.useState<ComponentInstance[]>([]);
  const [mode, setMode] = React.useState<'code' | 'attr' | null>(null);
  const [editorHeight, setEditorHeight] = React.useState(0);
  const [saved, setSaved] = React.useState(true);

  const saveRippleRef = React.useRef<any>(null);
  const saveButtonRef = React.useRef<any>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const inspectPipelineRef = React.useRef<InspectPipelineRef>(null);
  const pipelineEditorRef = React.useRef<PipelineEditorRef>(null);

  React.useEffect(() => {
    if (pipeline) {
      setPipelineOpened(true);
    } else {
      setPipelineOpened(false);
      setMode(null);
      setComponentOrder(null);

      // TODO: Get components from backend
      console.log('TODO: Get components from backend');
      setComponents(
        (() => {
          let i: number;
          const comps: ComponentInstance[] = [];
          for (i = 0; i < 20; i += 1) {
            comps.push({
              id: i,
              name: `Component ${i}`,
              functionName: `comp_${i}`,
              description: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: `This is component ${i}`,
                      },
                    ],
                  },
                ],
              },
              code: `def comp_${i}(user_message, data):\n  return data\n`,
              order: i,
              state: { [`State ${i}`]: Math.random(), Greet: 'Hi' },
              isEnabled: Math.random() < 0.5,
              isTemplate: Math.random() < 0.5,
              createdAt: new Date(),
            });
          }

          return comps;
        })(),
      );

      setSaved(true);
    }
  }, [pipeline]);

  const handlePipelineBack = () => {
    if (pipelineOpened && !saved) {
      if (!window.confirm(unsaveMessage)) {
        return;
      }
    }

    setPipelineOpened(false);
    setPipeline(null);
  };

  const handleSave = () => {
    if (saved) {
      return;
    }

    pipelineEditorRef.current?.setIsSaving(true);
    updateComponentsFromEditor();

    // TODO: Save to backend
    console.log('TODO: Save to backend');
    console.log(
      'Pipeline name: ',
      inspectPipelineRef.current?.getPipelineName(),
    );
    setSaved(true);
  };

  const component = React.useMemo(
    () => (componentOrder !== null ? components[componentOrder] : null),
    [components, componentOrder],
  );

  const handleUnsave = () => {
    setSaved(false);
  };

  const handleSetComponentsUnsave = (c: ComponentInstance[]) => {
    setComponents(c);
    handleUnsave();
  };

  const updateComponentsFromEditor = () => {
    if (componentOrder === null) {
      return;
    }

    const currComp = components[componentOrder];
    setComponents(
      components.map((comp) => {
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
      }),
    );
  };

  const handleSetComponent = (c: ComponentInstance | null) => {
    if (componentOrder !== null && c) {
      updateComponentsFromEditor();
    }
    setComponentOrder(c?.order ?? null);
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
                <Chat height={editorHeight} />
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
