import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import CRM from './CRM';
import CustomerDashboard from './CustomerDashboard';
import Expenses from './Expenses';
import Inventory from './Inventory';
import Reports from './Reports';
import Sales from './Sales';
import Home from './Home';
import Invoices from './Invoice/Invoices';
import './style.css';
import Dock from './Dock';
import PaymentDashboard from './PaymentDashboard';

import { VscHome, VscOrganization, VscDashboard, VscBook, VscLibrary, VscGraphLine, VscServerProcess, VscFile, VscSymbolOperator } from 'react-icons/vsc';


import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Box, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Toolbar, Typography, IconButton, AppBar, useMediaQuery, Container
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

const drawerWidth = 220;

const navItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'CRM', icon: <PeopleIcon />, path: '/crm' },
  { text: 'Customer Dashboard', icon: <DashboardIcon />, path: '/customer-dashboard' },
  { text: 'Expenses', icon: <ReceiptIcon />, path: '/expenses' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
  { text: 'Sales', icon: <MonetizationOnIcon />, path: '/sales' },
  { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
];




// --- MUI custom neutral, minimal theme --- //
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#242426' }, // dark charcoal
      secondary: { main: '#bdbdbd' }, // soft grey
      background: {
        default: mode === 'light' ? '#f7f7fa' : '#19191b',
        paper: mode === 'light' ? '#fff' : '#222224'
      },
      text: {
        primary: mode === 'light' ? '#242426' : '#f5f6fa',
        secondary: mode === 'light' ? '#6c6d6f' : '#bdbdbd'
      }
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      h6: { fontWeight: 600, letterSpacing: 0.2 },
      body1: { fontSize: '1rem', lineHeight: 1.7 },
      button: { fontWeight: 500, textTransform: 'none', letterSpacing: 0.2 }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow: '0 2px 16px rgba(36,36,38,0.04)'
          }
        }
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            fontSize: '1rem'
          }
        }
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: mode === 'light' ? '#ededed' : '#232325',
              color: '#131313'
            }
          }
        }
      }
    }
  });

function NavigationDrawer({ open, handleDrawerToggle }) {
  const location = useLocation();
  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={handleDrawerToggle}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'var(--color-container-bg, #fff)',
          borderRight: '1px solid #e7e7ef',
          boxShadow: 6,
        },
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo192.png" alt="ERP Logo" style={{ width: 36, marginRight: 10 }} />
          <Typography variant="h6" color="primary">ERP</Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>

      <List sx={{ mt: 2 }}>
        {navItems.map(item => {
          const selected = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={selected}
              sx={{
                borderRadius: 2,
                mb: 1,
                mx: 1,
                backgroundColor: selected ? 'var(--color-nav-active)' : 'transparent',
                color: selected ? 'var(--color-primary)' : 'inherit',
                '&:hover': {
                  backgroundColor: 'var(--color-nav-hover)',
                  '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                    color: 'var(--color-primary)',
                  },
                },
                transition: '0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  color: selected ? 'var(--color-primary)' : '#757575',
                  minWidth: 32,
                  transition: 'color 0.2s',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: selected ? 'var(--color-primary)' : 'inherit',
                  transition: 'color 0.2s',
                  fontWeight: selected ? 600 : 400,
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

function AppContent({ mode, setMode }) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  const handleDrawerToggle = () => setOpen(!open);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };
const items = [
  { text: 'Home', icon: <VscHome size={18} color="white" />, onClick: () => navigate('/') },
  { text: 'CRM', icon: <VscOrganization size={18} color="white" />, onClick: () => navigate('/crm') },
  { text: 'Customer Dashboard', icon: <VscDashboard size={18} color="white" />, onClick: () => navigate('/customer-dashboard') },
  { text: 'Expenses', icon: <VscBook size={18} color="white" />, onClick: () => navigate('/expenses') },
  { text: 'Inventory', icon: <VscLibrary size={18} color="white" />, onClick: () => navigate('/inventory') },
  { text: 'Reports', icon: <VscGraphLine size={18} color="white" />, onClick: () => navigate('/reports') },
  { text: 'Sales', icon: <VscServerProcess size={18} color="white" />, onClick: () => navigate('/sales') },
  { text: 'Invoices', icon: <VscFile size={18} color="white" />, onClick: () => navigate('/invoices') },
  { text: 'Payments', icon: <VscSymbolOperator size={18} color="white" />, onClick: () => navigate('/payments') },
];

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    const routeMap = {
      home: '/',
      crm: '/crm',
      'customer dashboard': '/customer-dashboard',
      expenses: '/expenses',
      inventory: '/inventory',
      products: '/inventory',
      reports: '/reports',
      sales: '/sales',
      invoices: '/invoices',
    };

    const matchedPath = Object.entries(routeMap).find(([keyword]) =>
      query.includes(keyword)
    );

    if (matchedPath) {
      navigate(matchedPath[1]);
    } else {
      alert('No matching page found!');
    }
    setSearchQuery('');
  };



  // State to control dock visibility
  const [dockVisible, setDockVisible] = React.useState(false);

  // Show dock on mouse move near bottom, hide after mouse leaves
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      const threshold = 80; // px from bottom
      if (window.innerHeight - e.clientY < threshold) {
        setDockVisible(true);
      } else if (dockVisible) {
        setDockVisible(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
    // eslint-disable-next-line
  }, [dockVisible]);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        flexDirection: 'column',
      }}
    >
      <AppBar elevation={0}
        position="fixed"
        color="transparent"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'var(--color-navbar-bg, #fff)',
          boxShadow: '0 1px 0 0 #ececec'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 60 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton edge="start" onClick={handleDrawerToggle} sx={{
              mr: 2, color: '#19191B'
            }} >
              <MenuIcon style={{ fontSize: 26 }} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo1.png" alt="ERP Logo" style={{ width: 30, marginRight: 10, filter: 'grayscale(100%)' }} />
              <Typography variant="h6" noWrap sx={{
                fontWeight: 600, color: 'var(--color-heading)', fontSize: 20
              }} onClick={() => navigate('/')}>
                ERP System
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Search Box */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                backgroundColor: 'var(--color-search-bg)',
                borderRadius: 1.5,
                px: 1.5,
                py: 0.5,
                mr: 2,
                border: '1px solid #ededed'
              }}
            >
              <SearchIcon sx={{ fontSize: 19, color: '#949494', cursor: 'pointer' }} onClick={handleSearch} />
              <InputBase
                placeholder="Search…"
                sx={{ ml: 1, color: 'inherit', fontSize: 16, width: 120, fontWeight: 500 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                inputProps={{ style: { background: 'none' } }}
              />
            </Box>
            {/* Theme toggle */}
            <IconButton onClick={toggleTheme} sx={{ mr: 1, color: '#242426' }}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            {/* <IconButton color="inherit" sx={{ ml: 0.5 }}>
              <Avatar alt="User" src="/static/images/avatar/1.jpg" />
            </IconButton> */}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>
        <NavigationDrawer open={open && !isMobile} handleDrawerToggle={handleDrawerToggle} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            ml: open && !isMobile ? `${drawerWidth}px` : 0,
            transition: 'margin-left 0.3s',
            background: 'var(--color-bg, #f7f7fa)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 60px - 68px)', // 60px AppBar, 68px Dock
          }}
        >
          <Toolbar />

          <Box
            sx={{
              flexGrow: 1,
              width: '100%',
              minHeight: 'calc(100vh - 112px - 68px)', // subtract Dock height
              p: { xs: 1, md: 2 }
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/:id" element={<Invoices />} />
              <Route path="/payments" element={<PaymentDashboard />} />
            </Routes>
          </Box>

          <Box
            component="footer"
            sx={{
              mt: 4,
              textAlign: 'center',
              py: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              color: 'text.secondary',
              fontWeight: 400,
              fontSize: 15
            }}
          >
            <Typography variant="body2">
              © 2025 ADHIL . All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Dock fixed at the bottom, only visible on hover near bottom */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100vw',
          zIndex: (theme) => theme.zIndex.drawer + 2,
          bgcolor: 'transparent',
          pointerEvents: dockVisible ? 'auto' : 'none',
        }}
      >
        <Box
          sx={{
            opacity: dockVisible ? 1 : 0,
            transition: 'opacity 0.25s',
            pointerEvents: dockVisible ? 'auto' : 'none',
          }}
        >
          <Dock
            items={items}
            panelHeight={68}
            baseItemSize={50}
            magnification={70}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });
  const theme = getTheme(mode);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent mode={mode} setMode={setMode} />
      </Router>
    </ThemeProvider>
  );
}
