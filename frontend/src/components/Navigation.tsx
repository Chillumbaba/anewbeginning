import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const Navigation: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Task Tracker
        </Typography>
        <Button
          color="inherit"
          component={RouterLink}
          to="/"
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          Home
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/grid"
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          Progress Grid
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/rules"
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          Rules
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 