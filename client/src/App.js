import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
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

function AppContent() {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  const handleDrawerToggle = () => setOpen(!open);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, boxShadow: 3 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            ERP System
          </Typography>
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

        <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
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

        <Box component="footer" sx={{ mt: 4, textAlign: 'center', py: 2, borderTop: '1px solid #ccc' }}>
          <Typography variant="body2" color="textSecondary">
            © 2025 ADHIL . All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}