import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Snackbar, TableContainer, InputLabel, FormControl
} from '@mui/material';

export default function CustomerDashboard() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    setAllCustomers(data);
    setFilteredCustomers(data);
  };

  const handleSearch = e => {
    const q = e.target.value.trim().toLowerCase();
    setFilteredCustomers(allCustomers.filter(c => c.name.toLowerCase().includes(q)));
  };

  const handleSelect = e => {
    setSelectedCustomer(e.target.value);
    if (e.target.value) {
      loadSalesForCustomer(e.target.value);
    } else {
      setSales([]);
      setSummary('');
    }
  };

  const loadSalesForCustomer = async (customerName) => {
    const res = await fetch('/api/sales');
    const allSales = await res.json();
    const filtered = allSales.filter(sale => sale.customerName === customerName);
    setSales(filtered);
    let totalSpent = 0;
    filtered.forEach(sale => { totalSpent += sale.totalAmount; });
    setSummary(filtered.length ? `Total Spent by ${customerName}: ₹${totalSpent}` : '');
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Typography variant="h4" gutterBottom>Customer Sales Dashboard</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
          <TextField label="Search customers..." onInput={handleSearch} />
          <FormControl>
            <InputLabel id="customerSelect-label">Select Customer</InputLabel>
            <Select
              labelId="customerSelect-label"
              id="customerSelect"
              value={selectedCustomer}
              label="Select Customer"
              onChange={handleSelect}
            >
              <MenuItem value="">-- Select Customer --</MenuItem>
              {filteredCustomers.map(c => (
                <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      {sales.length > 0 && (
        <Paper sx={{ p: 3, mb: 2 }} elevation={3}>
          <TableContainer>
            <Table id="salesTable">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale, idx) => {
                  const itemNames = sale.items.map(i => i.productName).join(', ');
                  const qtys = sale.items.map(i => i.quantity).join(', ');
                  const prices = sale.items.map(i => i.price).join(', ');
                  const saleDate = new Date(sale.createdAt).toLocaleDateString();
                  return (
                    <TableRow key={idx}>
                      <TableCell>{saleDate}</TableCell>
                      <TableCell>{itemNames}</TableCell>
                      <TableCell>{qtys}</TableCell>
                      <TableCell>{prices}</TableCell>
                      <TableCell>{sale.totalAmount}</TableCell>
                      <TableCell>{sale.status}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography className="summary" id="summary" sx={{ mt: 2 }}>{summary}</Typography>
        </Paper>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
} 