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
import './style.css';
import './style1index.css';

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



const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#007bff' },
    background: { default: '#f4f6fa' },
  },
  typography: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    h6: { fontWeight: 600 },
    body1: { fontSize: '1rem' },
  },
});

const drawerWidth = 220;

const navItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'CRM', icon: <PeopleIcon />, path: '/crm' },
  { text: 'Customer Dashboard', icon: <DashboardIcon />, path: '/customer-dashboard' },
  { text: 'Expenses', icon: <ReceiptIcon />, path: '/expenses' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
  { text: 'Sales', icon: <MonetizationOnIcon />, path: '/sales' },
];

function NavigationDrawer({ open, handleDrawerToggle }) {
  const location = useLocation();

  return (
    <Drawer
      variant="temporary"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: '#fff',
          transition: 'width 0.3s',
          boxShadow: 3,
        },
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo192.png" alt="ERP Logo" style={{ width: 40, marginRight: 10 }} />
          <Typography variant="h6" color="primary">ERP</Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>

      <List sx={{ mt: 2 }}>
        {navItems.map(item => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mb: 1,
              mx: 1,
              backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
              '&:hover': { backgroundColor: 'primary.light' },
              transition: '0.2s ease',
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
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



  return (
    <Box
  sx={{
    display: 'flex',
    minHeight: '100vh',
    bgcolor: 'background.default',
    color: 'text.primary',
  }}
>

<AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, boxShadow: 3, bgcolor: 'primary.main' }}>
  <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
    {/* Left Section: Menu Button + Logo + Title */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        color="inherit"
        aria-label="toggle drawer"
        onClick={handleDrawerToggle}
        edge="start"
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img src="/logo192.png" alt="ERP Logo" style={{ width: 32, marginRight: 10 }} />
        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
          ERP System
        </Typography>
      </Box>
    </Box>

    {/* Right Section: Search + Notifications + Avatar */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* Search Box */}
<Box
  sx={{
    display: { xs: 'none', sm: 'flex' },
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1,
    px: 1.5,
    py: 0.5,
    mr: 2,
  }}
>
  <SearchIcon sx={{ fontSize: 20, color: 'white', cursor: 'pointer' }} onClick={handleSearch} />
  <InputBase
    placeholder="Search…"
    sx={{ ml: 1, color: 'white' }}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
  />
</Box>



      {/* Notification Icon */}
<IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
  {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
</IconButton>


      {/* Avatar */}
      <IconButton color="inherit">
        <Avatar alt="User" src="/static/images/avatar/1.jpg" />
      </IconButton>
    </Box>
  </Toolbar>
</AppBar>


      <NavigationDrawer open={open && !isMobile} handleDrawerToggle={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          ml: open && !isMobile ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.3s',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />

        <Container
  maxWidth="lg"
  sx={{
    flexGrow: 1,
    bgcolor: 'background.default',
    color: 'text.primary',
    borderRadius: 2,
    boxShadow: 1,
    p: 3,
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
          </Routes>
        </Container>

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
  }}
>
  <Typography variant="body2">
    © 2025 ADHIL . All rights reserved.
  </Typography>
</Box>

      </Box>
    </Box>
  );
}

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#007bff' },
      background: { default: mode === 'light' ? '#f4f6fa' : '#121212' },
    },
    typography: {
      fontFamily: "'Segoe UI', Arial, sans-serif",
      h6: { fontWeight: 600 },
      body1: { fontSize: '1rem' },
    },
  });

export default function App() {
  const [mode, setMode] = useState(() => {
    // Try to load from localStorage, fallback to 'light'
    return localStorage.getItem('themeMode') || 'light';
  });
  const theme = getTheme(mode);

  // Set data-theme attribute on <html> for CSS variables
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


