import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Component } from '../models/Component';
import MarkdownEditor from './MarkdownEditor';

export interface ComponentDetailsProps {
  component: Component;
}

function ComponentDetails({ component }: ComponentDetailsProps) {
  return (
    <Box>
      <Typography variant="h6">{component.name}</Typography>
      <Typography variant="body1">ID: {component.id}</Typography>
      <Typography variant="body1">
        Function Name: <code>{component.function_name}</code>
      </Typography>
      <Typography variant="body1">
        Created At: {new Date(component.created_at).toLocaleString()}
      </Typography>
      <Box py={1}>
        <MarkdownEditor readonly content={component.description} />
      </Box>
    </Box>
  );
}

export default ComponentDetails;
