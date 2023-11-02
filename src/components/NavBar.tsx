import React from 'react';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import useTheme from '@mui/material/styles/useTheme';
import { useNavigate, useLocation } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import SchemaIcon from '@mui/icons-material/Schema';
import { alpha } from '@mui/material';
import { useCookies } from 'react-cookie';

const pages = [
  {
    icon: <SchemaIcon key="/pipeline/" />,
    label: 'Pipeline',
    path: '/pipeline/',
  },
  {
    icon: <AssignmentIndIcon key="/account/" />,
    label: 'Account',
    path: '/account/',
  },
];

interface ElevationScrollProps {
  window?: () => Window;
  children: React.ReactElement;
}

function ElevationScroll({ children, window }: ElevationScrollProps) {
  const theme = useTheme();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    sx: {
      background: trigger
        ? alpha(
            theme.palette.background.paper,
            1 - theme.palette.action.disabledOpacity,
          )
        : theme.palette.background.default,
      backdropFilter: 'blur(8px)',
      ...children.props.sx,
    },
  });
}

export interface NavBarProps {
  children?: React.ReactNode;
}

function NavBar({ children }: NavBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [, , removeCookie] = useCookies();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings/');
  };

  const handleLogout = () => {
    removeCookie('access-token');
    removeCookie('refresh-token');
    navigate('/login/');
  };

  return (
    <>
      <ElevationScroll>
        <AppBar
          sx={{
            color: 'primary.main',
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" mr={2}>
              Chat Conductor
            </Typography>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-evenly"
              gap={1}
            >
              {pages.map(({ icon, label, path }) => (
                <Button
                  key={path}
                  sx={{
                    display: 'block',
                    backgroundColor: location.pathname.startsWith(
                      path.slice(0, -1),
                    )
                      ? alpha(
                          theme.palette.primary.main,
                          theme.palette.action.selectedOpacity,
                        )
                      : undefined,
                  }}
                  onClick={() => {
                    if (path !== location.pathname) navigate(path);
                  }}
                >
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                  >
                    {icon}
                    {label}
                  </Box>
                </Button>
              ))}
            </Box>
            <Box flexGrow={1} />
            <IconButton size="large" onClick={handleMenu} color="inherit">
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        disableScrollLock
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleSettings}>Settings</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
      {children}
    </>
  );
}

NavBar.defaultProps = {
  children: null,
};

export default NavBar;
