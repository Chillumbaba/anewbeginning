import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, useTheme, IconButton, Menu, MenuItem, useMediaQuery } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

const Navigation: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/grid', label: 'Grid' },
    { path: '/stats', label: 'Statistics' },
    { path: '/rules', label: 'Rules' },
    { path: '/test-db', label: 'DB Admin' },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        maxWidth: 1200, 
        width: '100%', 
        margin: '0 auto',
        flexWrap: 'wrap',
        padding: isMobile ? '8px 16px' : '0 24px',
      }}>
        <Box component={Link} to="/" sx={{ 
          textDecoration: 'none',
          color: 'inherit',
          fontWeight: 700,
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          letterSpacing: '-0.02em',
        }}>
          Benjamin Franklin Method
        </Box>
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: theme.palette.custom.beige,
                  borderRadius: 2,
                  mt: 1,
                }
              }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.path}
                  component={Link}
                  to={item.path}
                  onClick={handleMenuClose}
                  sx={{
                    color: '#000000',
                    fontWeight: isActive(item.path) ? 700 : 400,
                    backgroundColor: isActive(item.path) ? `${theme.palette.custom.orange}!important` : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.custom.lightBlue,
                    },
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
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
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 