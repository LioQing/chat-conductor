import React from 'react';
import Box from '@mui/material/Box';
import ComponentAttributes, {
  ComponentAndStateKeys,
} from './ComponentAttributes';
import { ComponentInstance } from '../models/ComponentInstance';
import { JsonObject } from '../utils/JsonObject';
import usePrevious from '../hooks/usePrevious';
import { PipelineAttributes as PipelineAttributesData } from '../models/PipelineAttributes';
import PipelineAttributes, {
  PipelineAttributesAndKeys,
} from './PipelineAttributes';

const componentToComponentAndStateKeys = (
  component: ComponentInstance | null,
) => {
  if (!component) {
    return null;
  }

  return {
    component,
    stateKeys: Object.entries(component.state).map(([k]) => k),
    argumentKeys: Object.entries(component.arguments).map(([k]) => k),
  };
};

const pipelineAttributesToPipelineAttributesAndKeys = (
  pipelineAttributes: PipelineAttributesData | null,
): PipelineAttributesAndKeys | null => {
  if (!pipelineAttributes) {
    return null;
  }

  return {
    attributes: pipelineAttributes,
    stateKeys: Object.entries(pipelineAttributes.state).map(([k]) => k),
  };
};

export interface PipelineEditorRef {
  getFunctionName: () => string;
  getName: () => string;
  getArguments: () => JsonObject;
  getReturnType: () => string;
  getDescription: () => JsonObject;
  getCode: () => string;
  getState: () => JsonObject;
  setIsSaving: (isSaving: boolean) => void;
  setIsRunning: (isRunning: boolean) => void;
}

export interface PipelineEditorProps {
  component: ComponentInstance | null;
  pipelineAttributes: PipelineAttributesData | null;
  opened: boolean;
  onUnsave: () => void;
}

const PipelineEditor = React.forwardRef(
  (
    { component, pipelineAttributes, opened, onUnsave }: PipelineEditorProps,
    ref,
  ) => {
    const [componentAndStateKeys, setComponentAndStateKeys] =
      React.useState<ComponentAndStateKeys | null>(null);
    const [pipelineAttributesAndKeys, setPipelineAttributesAndKeys] =
      React.useState<PipelineAttributesAndKeys | null>(null);
    const [isSaving, setIsSaving] = React.useState(false); // avoid unsaving when updated components during save
    const [isRunning, setIsRunning] = React.useState(false); // avoid unsaving when updated components during running
    const prevOpened = usePrevious(opened);

    const handleSetComponentAndStateKeysUnsave = (
      componentAndStateKeys: ComponentAndStateKeys | null,
      unsave: boolean = true,
    ) => {
      setComponentAndStateKeys(componentAndStateKeys);

      if (isRunning) {
        setIsRunning(false);
        return;
      }

      if (unsave) {
        onUnsave();
      }
    };

    const handleSetPipelineAttributesAndKeysUnsave = (
      pipelineAttributesAndKeys: PipelineAttributesAndKeys | null,
      unsave: boolean = true,
    ) => {
      setPipelineAttributesAndKeys(pipelineAttributesAndKeys);

      if (isRunning) {
        setIsRunning(false);
        return;
      }

      if (unsave) {
        onUnsave();
      }
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
          opened === prevOpened,
      );
    }, [component]);

    React.useEffect(() => {
      // Only unsave if component info are changed (not selected)
      if (isSaving) {
        setIsSaving(false);
        return;
      }

      handleSetPipelineAttributesAndKeysUnsave(
        pipelineAttributesToPipelineAttributesAndKeys(pipelineAttributes),
        false,
      );
    }, [pipelineAttributes]);

    React.useImperativeHandle(
      ref,
      (): PipelineEditorRef => ({
        getFunctionName: () =>
          componentAndStateKeys?.component.function_name ?? '',
        getName: () => componentAndStateKeys?.component.name ?? '',
        getArguments: () => componentAndStateKeys?.component.arguments ?? {},
        getReturnType: () =>
          componentAndStateKeys?.component.return_type ?? 'none',
        getDescription: () =>
          componentAndStateKeys?.component.description ?? {},
        getCode: () => componentAndStateKeys?.component.code ?? '',
        getState: () => componentAndStateKeys?.component.state ?? {},
        setIsSaving: (isSaving: boolean) => setIsSaving(isSaving),
        setIsRunning: (isRunning: boolean) => setIsRunning(isRunning),
      }),
    );

    return opened && componentAndStateKeys ? (
      <Box sx={{ overflowY: 'auto' }}>
        <Box px={3}>
          <ComponentAttributes
            componentAndStateKeys={componentAndStateKeys}
            setComponentAndStateKeys={handleSetComponentAndStateKeysUnsave}
          />
        </Box>
      </Box>
    ) : pipelineAttributesAndKeys ? (
      <Box sx={{ overflowY: 'auto' }}>
        <Box px={3}>
          <PipelineAttributes
            pipelineAttributesAndKeys={pipelineAttributesAndKeys}
            setPipelineAttributesAndKeys={
              handleSetPipelineAttributesAndKeysUnsave
            }
          />
        </Box>
      </Box>
    ) : null;
  },
);

export default PipelineEditor;
