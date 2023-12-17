import React from 'react';
import Box from '@mui/material/Box';
import ComponentAttributes, {
  ComponentAttributesRef,
} from './ComponentAttributes';
import { ComponentInstance } from '../models/ComponentInstance';
import { PipelineAttributes as PipelineAttributesData } from '../models/PipelineAttributes';
import PipelineAttributes, {
  PipelineAttributesRef,
} from './PipelineAttributes';

export interface PipelineEditorRef {
  getPipelineAttributes: () => PipelineAttributesData | null;
  getComponent: () => ComponentInstance | null;
}

export interface PipelineEditorProps {
  pipelineAttributes: PipelineAttributesData | null;
  component: ComponentInstance | null;
  markdown: boolean;
  onComponentChange: () => void;
  onPipelineAttributesChange: () => void;
}

const PipelineEditor = React.forwardRef(
  (
    {
      pipelineAttributes,
      component,
      markdown,
      onComponentChange,
      onPipelineAttributesChange,
    }: PipelineEditorProps,
    ref: React.Ref<PipelineEditorRef>,
  ) => {
    const pipelineAttributesRef = React.useRef<PipelineAttributesRef>(null);
    const ComponentAttributesRef = React.useRef<ComponentAttributesRef>(null);

    React.useImperativeHandle(ref, () => ({
      getPipelineAttributes: () =>
        pipelineAttributesRef.current?.getPipelineAttributes() ?? null,
      getComponent: () =>
        ComponentAttributesRef.current?.getComponent() ?? null,
    }));

    return component ? (
      <Box sx={{ overflowY: 'auto' }}>
        <Box px={3}>
          <ComponentAttributes
            ref={ComponentAttributesRef}
            component={component}
            markdown={markdown}
            onChange={onComponentChange}
          />
        </Box>
      </Box>
    ) : pipelineAttributes ? (
      <Box sx={{ overflowY: 'auto' }}>
        <Box px={3}>
          <PipelineAttributes
            ref={pipelineAttributesRef}
            pipelineAttributes={pipelineAttributes}
            markdown={markdown}
            onChange={onPipelineAttributesChange}
          />
        </Box>
      </Box>
    ) : null;
  },
);

export default PipelineEditor;
