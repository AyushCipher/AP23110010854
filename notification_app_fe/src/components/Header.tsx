import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Campus Notifications
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={{
              fontWeight: location.pathname === '/' ? 'bold' : 'normal',
              borderBottom: location.pathname === '/' ? '2px solid white' : 'none',
              borderRadius: 0,
            }}
          >
            All Notifications
          </Button>
          <Button
            component={Link}
            to="/priority"
            color="inherit"
            sx={{
              fontWeight: location.pathname === '/priority' ? 'bold' : 'normal',
              borderBottom: location.pathname === '/priority' ? '2px solid white' : 'none',
              borderRadius: 0,
            }}
          >
            Priority Notifications
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
