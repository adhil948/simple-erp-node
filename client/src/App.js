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
  Toolbar, Typography, IconButton, AppBar, useMediaQuery, Container,
  SwipeableDrawer
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
import InputBase from '@mui/material/InputBase';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

const drawerWidth = 280; // Increased for better mobile touch targets

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

// Enhanced theme with better mobile support
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#242426' },
      secondary: { main: '#bdbdbd' },
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
      h6: { 
        fontWeight: 600, 
        letterSpacing: 0.2,
        fontSize: { xs: '1.1rem', sm: '1.25rem' } // Responsive font sizes
      },
      body1: { 
        fontSize: { xs: '0.9rem', sm: '1rem' }, 
        lineHeight: 1.7 
      },
      button: { 
        fontWeight: 500, 
        textTransform: 'none', 
        letterSpacing: 0.2,
        fontSize: { xs: '0.875rem', sm: '1rem' }
      }
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
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }
        }
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            minHeight: 48, // Better touch targets on mobile
            '&.Mui-selected': {
              backgroundColor: mode === 'light' ? '#ededed' : '#232325',
              color: '#131313'
            }
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '@media (max-width: 768px)': {
              padding: '12px', // Larger touch targets on mobile
            }
          }
        }
      }
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 768,
        lg: 1024,
        xl: 1280,
      },
    },
  });

function NavigationDrawer({ open, handleDrawerToggle, isMobile }) {
  const location = useLocation();
  
  const drawerContent = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        px: 2,
        minHeight: { xs: 56, sm: 64 } // Responsive toolbar height
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo192.png" 
            alt="ERP Logo" 
            style={{ 
              width: isMobile ? 32 : 36, 
              marginRight: 10 
            }} 
          />
          <Typography 
            variant="h6" 
            color="primary"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            ERP
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>

      <List sx={{ mt: 2, px: 1 }}>
        {navItems.map(item => {
          const selected = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={selected}
              onClick={isMobile ? handleDrawerToggle : undefined} // Close drawer on mobile after selection
              sx={{
                borderRadius: 2,
                mb: 1,
                mx: 1,
                minHeight: { xs: 52, sm: 48 }, // Larger touch targets on mobile
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
                  minWidth: { xs: 40, sm: 32 }, // Larger icons on mobile
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
                  '& .MuiTypography-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </>
  );

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
        onOpen={handleDrawerToggle}
        disableBackdropTransition={false}
        disableDiscovery={false}
        sx={{
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'var(--color-container-bg, #fff)',
            borderRight: '1px solid #e7e7ef',
          },
        }}
      >
        {drawerContent}
      </SwipeableDrawer>
    );
  }

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
      {drawerContent}
    </Drawer>
  );
}

function AppContent({ mode, setMode }) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDrawerToggle = () => setOpen(!open);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const items = [
    { text: 'Home', icon: <VscHome size={isMobile ? 20 : 18} color="white" />, onClick: () => navigate('/') },
    { text: 'CRM', icon: <VscOrganization size={isMobile ? 20 : 18} color="white" />, onClick: () => navigate('/crm') },
    { text: 'Dashboard', icon: <VscDashboard size={isMobile ? 20 : 18} color="white" />, onClick: () => navigate('/customer-dashboard') },
    { text: 'Expenses', icon: <VscBook size={isMobile ? 20 : 18} color="white" />, onClick: () => navigate('/expenses') },
    { text: 'Inventory', icon: <VscLibrary size={isMobile ? 20 : 18} color="white" />, onClick: () => navigate('/inventory') },
    { text: 'Reports', icon: <VscGraphLine size={isMobile ? 20 : 18} color="white" />, onClick: () => navigate('/reports') },
    { text: 'Sales', icon: <VscServerProcess size={isMobile ? 20 : 18} color="white" />, onClick: () => navigate('/sales') },
    { text: 'Invoices', icon: <VscFile size={isMobile ? 20 : 18} color="white" />, onClick: () => navigate('/invoices') },
    { text: 'Payments', icon: <VscSymbolOperator size={isMobile ? 20 : 18} color="white" />, onClick: () => navigate('/payments') },
  ];

  

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    const routeMap = {
      home: '/',
      crm: '/crm',
      'customer dashboard': '/customer-dashboard',
      dashboard: '/customer-dashboard',
      expenses: '/expenses',
      inventory: '/inventory',
      products: '/inventory',
      reports: '/reports',
      sales: '/sales',
      invoices: '/invoices',
      payments: '/payments',
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

  // Show dock on mouse move near bottom on desktop, always visible on mobile
  React.useEffect(() => {
    if (isMobile) {
      setDockVisible(false); // Always visible on mobile
      return;
    }

    const handleMouseMove = (e) => {
      const threshold = 80;
      if (window.innerHeight - e.clientY < threshold) {
        setDockVisible(true);
      } else if (dockVisible) {
        setDockVisible(false);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [dockVisible, isMobile]);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        flexDirection: 'column',
      }}
    >
      <AppBar 
        elevation={0}
        position="fixed"
        color="transparent"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'var(--color-navbar-bg, #fff)',
          boxShadow: '0 1px 0 0 #ececec'
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              edge="start" 
              onClick={handleDrawerToggle} 
              sx={{
                mr: { xs: 1, sm: 2 }, 
                color: '#19191B',
                p: { xs: 1.5, sm: 1 }
              }} 
            >
              <MenuIcon style={{ fontSize: isMobile ? 24 : 26 }} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/logo1.png" 
                alt="ERP Logo" 
                style={{ 
                  width: isMobile ? 24 : 30, 
                  marginRight: isMobile ? 6 : 10, 
                  filter: 'grayscale(100%)' 
                }} 
              />
              <Typography 
                variant="h6" 
                noWrap 
                sx={{
                  fontWeight: 600, 
                  color: 'var(--color-heading)', 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  cursor: 'pointer'
                }} 
                onClick={() => navigate('/')}
              >
                {isMobile ? 'ERP' : 'ERP System'}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Search Box - Hidden on very small screens */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                backgroundColor: 'var(--color-search-bg)',
                borderRadius: 1.5,
                px: 1.5,
                py: 0.5,
                mr: { sm: 1, md: 2 },
                border: '1px solid #ededed',
                width: { sm: 120, md: 160 }
              }}
            >
              <SearchIcon 
                sx={{ fontSize: 19, color: '#949494', cursor: 'pointer' }} 
                onClick={handleSearch} 
              />
              <InputBase
                placeholder="Search…"
                sx={{ 
                  ml: 1, 
                  color: 'inherit', 
                  fontSize: { sm: 14, md: 16 }, 
                  width: '100%',
                  fontWeight: 500 
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                inputProps={{ style: { background: 'none' } }}
              />
            </Box>
            
            {/* Theme toggle */}
            <IconButton 
              onClick={toggleTheme} 
              sx={{ 
                color: '#242426',
                p: { xs: 1.5, sm: 1 }
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>
        <NavigationDrawer 
          open={open} 
          handleDrawerToggle={handleDrawerToggle} 
          isMobile={isMobile}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 2, md: 4 },
            transition: 'margin-left 0.3s',
            background: 'var(--color-bg, #f7f7fa)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: `calc(100vh - ${isMobile ? '56px' : '64px'} - ${isMobile ? '80px' : '68px'})`, // Adjust for mobile AppBar and Dock
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />

          <Box
            sx={{
              flexGrow: 1,
              width: '100%',
              minHeight: `calc(100vh - ${isMobile ? '112px' : '128px'} - ${isMobile ? '80px' : '68px'})`,
              p: { xs: 0.5, sm: 1, md: 2 }
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

          {/* Footer - Hidden on mobile to save space */}
          {!isMobile && (
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
          )}
        </Box>
      </Box>

      {/* Enhanced Dock with mobile optimizations */}
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
            panelHeight={isMobile ? 80 : 68} // Larger on mobile
            baseItemSize={isMobile ? 55 : 50} // Larger touch targets on mobile
            magnification={isMobile ? 75 : 70} // Slightly larger magnification on mobile
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
