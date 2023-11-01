import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SxProps, alpha, useTheme } from '@mui/material/styles';
import React from 'react';

export interface PanelProps {
  elevation?: number;
  paperRef?: React.Ref<HTMLDivElement>;
  wrapper?: React.ReactElement;
  children?: React.ReactNode;
  title?: string;
  titleSx?: SxProps;
  trailing?: React.ReactNode;
  sx?: SxProps;
}

function Panel({
  elevation,
  paperRef,
  wrapper,
  children,
  title,
  titleSx,
  trailing,
  sx,
}: PanelProps) {
  const theme = useTheme();
  const defaultSx: SxProps = {
    p: 3,
    pt: 1,
    backgroundColor: alpha(
      theme.palette.background.paper,
      1 - theme.palette.action.disabledOpacity,
    ),
    backdropFilter: 'blur(6px)',
  };
  const mergedSx = sx ? { ...defaultSx, ...sx } : defaultSx;

  const defaultTitleSx: SxProps = {
    my: 1,
  };
  const mergedTitleSx = titleSx
    ? { ...defaultTitleSx, ...titleSx }
    : defaultTitleSx;

  const inner = (
    <>
      {trailing ? (
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          sx={mergedTitleSx}
        >
          <Typography variant="h5">{title}</Typography>
          <Box flexGrow={1} />
          {trailing}
        </Box>
      ) : (
        title && (
          <Typography variant="h5" sx={mergedTitleSx}>
            {title}
          </Typography>
        )
      )}
      {children}
    </>
  );

  return (
    <Paper elevation={elevation} sx={mergedSx} ref={paperRef}>
      {wrapper ? React.cloneElement(wrapper, { children: inner }) : inner}
    </Paper>
  );
}

Panel.defaultProps = {
  elevation: 2,
  paperRef: undefined,
  wrapper: null,
  children: null,
  title: null,
  titleSx: undefined,
  trailing: null,
  sx: undefined,
};

export default Panel;
