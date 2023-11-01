import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StarterKit from '@tiptap/starter-kit';
import { RichTextEditor } from 'mui-tiptap';
import Component from '../models/Component';

export interface ComponentDescriptionProps {
  component: Component;
}

function ComponentDescription({ component }: ComponentDescriptionProps) {
  return (
    <Box>
      <Typography variant="h6">{component.name}</Typography>
      <Typography variant="body1">ID: {component.id}</Typography>
      <Typography variant="body1">
        Function Name: <code>{component.functionName}</code>
      </Typography>
      <Typography variant="body1">
        Created At: {component.createdAt.toLocaleString()}
      </Typography>
      <Box py={1}>
        <RichTextEditor
          editable={false}
          extensions={[StarterKit]}
          content={component.description}
        />
      </Box>
    </Box>
  );
}

export default ComponentDescription;
