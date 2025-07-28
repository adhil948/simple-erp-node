import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CRM from './CRM';
import CustomerDashboard from './CustomerDashboard';
import Expenses from './Expenses';
import Inventory from './Inventory';
import Reports from './Reports';
import Sales from './Sales';
import Home from './Home';
import './style.css';
import './style1index.css';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#007bff' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/crm">CRM</Button>
            <Button color="inherit" component={Link} to="/customer-dashboard">Customer Dashboard</Button>
            <Button color="inherit" component={Link} to="/expenses">Expenses</Button>
            <Button color="inherit" component={Link} to="/inventory">Inventory</Button>
            <Button color="inherit" component={Link} to="/reports">Reports</Button>
            <Button color="inherit" component={Link} to="/sales">Sales</Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
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
      </Router>
    </ThemeProvider>
  );
}

export default App;
