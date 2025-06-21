import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, useMediaQuery } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useTheme } from '@mui/material/styles';
import benjamin from '../assets/benjamin-franklin.png';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const navLinkStyle = {
    textDecoration: 'none',
    color: 'inherit',
    margin: '0 8px',
  };

  const activeNavLinkStyle = {
    ...navLinkStyle,
    textDecoration: 'underline',
    textDecorationThickness: '2px',
    textUnderlineOffset: '4px',
  };
  
  const menuItems = [
    { label: 'Record progress', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Set up Rules', to: '/rules' },
    { label: 'Administer', to: '/administer' },
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: 'black', color: 'white' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            anewbeginning
          </NavLink>
        </Typography>

        {!isMobile && (
          <Box>
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                style={({ isActive }) => (isActive ? activeNavLinkStyle : navLinkStyle)}
              >
                <Button color="inherit">{item.label}</Button>
              </NavLink>
            ))}
          </Box>
        )}

        {user && (
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar src={user.picture || benjamin} alt={user.name} sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
              {isMobile &&
                menuItems.map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => {
                      navigate(item.to);
                      handleClose();
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 