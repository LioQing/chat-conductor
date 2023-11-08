import React from 'react';
import Editor from '@monaco-editor/react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Panel from './Panel';
import ComponentAttributes, {
  ComponentAndStateKeys,
} from './ComponentAttributes';
import { ComponentInstance } from '../models/ComponentInstance';
import { JsonObject } from '../utils/JsonObject';
import usePrevious from '../hooks/usePrevious';

const componentToComponentAndStateKeys = (
  component: ComponentInstance | null,
) => {
  if (!component) {
    return null;
  }

  return {
    component,
    stateKeys: Object.entries(component.state).map(([k]) => k),
  };
};

export interface PipelineEditorRef {
  getName: () => string;
  getFunctionName: () => string;
  getDescription: () => string;
  getCode: () => string;
  getState: () => JsonObject;
  setIsSaving: (isSaving: boolean) => void;
}

export interface PipelineEditorProps {
  height: number;
  component: ComponentInstance | null;
  mode: 'code' | 'attr' | null;
  onUnsave: () => void;
}

const PipelineEditor = React.forwardRef(
  ({ height, component, mode, onUnsave }: PipelineEditorProps, ref) => {
    const theme = useTheme();
    const [code, setCode] = React.useState(component?.code ?? '');
    const [componentAndStateKeys, setComponentAndStateKeys] =
      React.useState<ComponentAndStateKeys | null>(null);
    const [isSaving, setIsSaving] = React.useState(false); // avoid unsaving when updated components during save
    const prevMode = usePrevious(mode);

    const handleSetComponentAndStateKeysUnsave = (
      componentAndStateKeys: ComponentAndStateKeys | null,
      unsave: boolean = true,
    ) => {
      setComponentAndStateKeys(componentAndStateKeys);
      if (unsave) {
        onUnsave();
      }
    };

    const handleChangeCode = (v: string | undefined) => {
      if (mode !== 'code' || !component) {
        console.error('mode must be code');
        return;
      }

      setCode(v ?? '');
      onUnsave();
    };

    React.useEffect(() => {
      // Only unsave if component info are changed (not selected)
      if (isSaving) {
        setIsSaving(false);
        return;
      }

      handleSetComponentAndStateKeysUnsave(
        componentToComponentAndStateKeys(component),
        Boolean(componentAndStateKeys) &&
          componentAndStateKeys?.component.id === component?.id &&
          mode === prevMode,
      );
      setCode(component?.code ?? '');
    }, [component]);

    const title = React.useMemo(() => {
      if (mode === 'code') {
        return 'Code';
      }

      if (mode === 'attr') {
        return 'Attributes';
      }

      return 'Nothing is selected';
    }, [mode]);

    React.useImperativeHandle(
      ref,
      () =>
        ({
          getName: () => componentAndStateKeys?.component.name ?? '',
          getFunctionName: () =>
            componentAndStateKeys?.component.function_name ?? '',
          getDescription: () =>
            componentAndStateKeys?.component.description ?? '',
          getCode: () => code,
          getState: () => componentAndStateKeys?.component.state ?? {},
          setIsSaving: (isSaving: boolean) => setIsSaving(isSaving),
        }) as PipelineEditorRef,
    );

    return (
      <Panel
        title={title}
        titleSx={{ mx: 3 }}
        wrapper={
          <Box display="flex" flexDirection="column" height={height - 24 - 8} />
        }
        sx={{ px: 0, width: '40%', height }}
      >
        {mode === 'code' ? (
          <Box
            height="100%"
            width="100%"
            overflow="hidden"
            borderRadius="8px"
            px={3}
          >
            <Editor
              theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
              language="python"
              value={code}
              onChange={handleChangeCode}
            />
          </Box>
        ) : mode === 'attr' && componentAndStateKeys ? (
          <Box sx={{ overflowY: 'auto' }}>
            <Box px={3}>
              <ComponentAttributes
                componentAndStateKeys={componentAndStateKeys}
                setComponentAndStateKeys={handleSetComponentAndStateKeysUnsave}
              />
            </Box>
          </Box>
        ) : null}
      </Panel>
    );
  },
);

export default PipelineEditor;
