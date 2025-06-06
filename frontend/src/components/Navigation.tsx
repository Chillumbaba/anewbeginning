import React from 'react';
import { AppBar, Toolbar, Button, Box, useTheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/grid', label: 'Grid' },
    { path: '/stats', label: 'Statistics' },
    { path: '/rules', label: 'Rules' },
    { path: '/test-db', label: 'Test DB' },
  ];

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        <Box component={Link} to="/" sx={{ 
          textDecoration: 'none',
          color: 'inherit',
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '-0.02em',
        }}>
          Benjamin Franklin Method
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                color: 'inherit',
                fontWeight: isActive(item.path) ? 700 : 400,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: 3,
                  backgroundColor: theme.palette.custom.orange,
                  opacity: isActive(item.path) ? 1 : 0,
                  transition: 'opacity 0.2s ease-in-out',
                },
                '&:hover::after': {
                  opacity: 0.7,
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 