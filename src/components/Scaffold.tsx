import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import NavBar from './NavBar';

function Scaffold() {
  const location = useLocation();
  const isPipeline = React.useMemo(
    () => location.pathname.startsWith('/pipeline'),
    [location.pathname],
  );

  const maxWidth = isPipeline ? false : undefined;

  return (
    <>
      <NavBar />
      <CssBaseline />
      <Container maxWidth={maxWidth}>
        <Box height={24} />
        <Outlet />
        <Box height={24} />
      </Container>
    </>
  );
}

export default Scaffold;
