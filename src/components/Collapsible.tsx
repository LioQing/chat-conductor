import React from 'react';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';

export interface CollapsibleProps {
  collapsed?: boolean;
  collapsedHeight?: number;
  collapsedWidth?: number;
  stored?: boolean;
  extraHeight?: number;
  extraWidth?: number;
  direction?: 'row' | 'column' | 'all';
  onCollapse?: (width: number, height: number) => void;
  sx?: React.ComponentProps<typeof Box>;
  boxSx?: React.ComponentProps<typeof Box>;
  children?: React.ReactNode;
}

function Collapsible({
  collapsed,
  collapsedHeight,
  collapsedWidth,
  stored,
  extraHeight,
  extraWidth,
  direction,
  onCollapse,
  sx,
  boxSx,
  children,
}: CollapsibleProps) {
  const theme = useTheme();
  const [height, setHeight] = React.useState<number>(0);
  const [width, setWidth] = React.useState<number>(0);
  const [fullyCollapsed, setFullyCollapsed] = React.useState<boolean>(false);
  const [collapseTimer, setCollapseTimer] =
    React.useState<NodeJS.Timeout | null>(null);
  const childrenRef = React.useRef<HTMLDivElement>(null);

  if (collapseTimer && !collapsed) {
    clearTimeout(collapseTimer);
    setCollapseTimer(null);
  }

  React.useEffect(() => {
    if (!collapsed) {
      setFullyCollapsed(false);
    } else {
      setCollapseTimer(
        setTimeout(
          () => setFullyCollapsed(true),
          theme.transitions.duration.standard,
        ),
      );
    }
  }, [collapsed]);

  React.useEffect(() => {
    onCollapse?.(width, height);
  }, [width, height, onCollapse]);

  React.useLayoutEffect(() => {
    if (!collapsed && childrenRef.current) {
      if (direction !== 'column') {
        setWidth(
          childrenRef.current.offsetWidth + (extraWidth ?? collapsedWidth ?? 0),
        );
      }
      if (direction !== 'row') {
        setHeight(
          childrenRef.current.offsetHeight +
            (extraHeight ?? collapsedHeight ?? 0),
        );
      }
    } else {
      setWidth(collapsedWidth ?? 0);
      setHeight(collapsedHeight ?? 0);
    }
  }, [collapsed, fullyCollapsed, children, childrenRef]);

  const boxedChildren = (
    <Box ref={childrenRef} sx={boxSx}>
      {!stored && fullyCollapsed ? null : children}
    </Box>
  );

  return (
    <Box
      height={direction === 'row' ? undefined : height}
      width={direction === 'column' ? undefined : width}
      overflow="hidden"
      sx={{ ...{ transition: theme.transitions.create('all') }, ...sx }}
    >
      {boxedChildren}
    </Box>
  );
}

Collapsible.defaultProps = {
  collapsed: false,
  collapsedHeight: 0,
  collapsedWidth: 0,
  stored: false,
  extraHeight: 0,
  extraWidth: 0,
  direction: 'column',
  sx: {},
  boxSx: {},
  onCollapse: () => {},
  children: null,
};

export default Collapsible;
