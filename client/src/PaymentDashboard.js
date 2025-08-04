// PaymentDashboard.js
import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, TableSortLabel, Box, Button, TextField, MenuItem, Select, InputLabel, FormControl, Typography
} from '@mui/material';

function sortComparator(a, b, orderBy, order) {
  let valA = a[orderBy];
  let valB = b[orderBy];
  if (orderBy === 'date') {
    valA = new Date(valA);
    valB = new Date(valB);
  } else if (orderBy === 'amount') {
    valA = Number(valA);
    valB = Number(valB);
  } else {
    // text sort
    valA = valA ? valA.toString().toLowerCase() : '';
    valB = valB ? valB.toString().toLowerCase() : '';
  }
  if (valA < valB) return order === 'asc' ? -1 : 1;
  if (valA > valB) return order === 'asc' ? 1 : -1;
  return 0;
}

export default function PaymentDashboard() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const res = await fetch('/api/payments');
    const data = await res.json();
    setPayments(data);
  };

  // Filter logic
  const filteredPayments = payments.filter(p =>
    (!search ||
      (p.amount && p.amount.toString().includes(search)) ||
      (p.note && p.note.toLowerCase().includes(search.toLowerCase())) ||
      (p.method && p.method.toLowerCase().includes(search.toLowerCase())) ||
      (p.date && new Date(p.date).toLocaleDateString().includes(search)) ||
      // Invoice fields
      (p.invoice && p.invoice._id && p.invoice._id.includes(search)) ||
      (p.invoice && p.invoice.status && p.invoice.status.toLowerCase().includes(search.toLowerCase())) ||
      (p.invoice && p.invoice.customer && p.invoice.customer.name && p.invoice.customer.name.toLowerCase().includes(search.toLowerCase()))
    ) &&
    (!method || p.method === method)
  );

  // Sort logic
  const sortedPayments = [...filteredPayments].sort((a, b) => sortComparator(a, b, orderBy, order));

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          All Payments Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search (amount, note, method, invoice)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 250 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="method-label">Method</InputLabel>
            <Select
              labelId="method-label"
              value={method}
              label="Method"
              onChange={e => setMethod(e.target.value)}
            >
              <MenuItem value="">All Methods</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="bank">Bank</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => {setSearch(''); setMethod('');}}>Clear</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={() => {
                      setOrder(orderBy === 'date' && order === 'asc' ? 'desc' : 'asc');
                      setOrderBy('date');
                    }}
                  >Date</TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'amount'}
                    direction={orderBy === 'amount' ? order : 'asc'}
                    onClick={() => {
                      setOrder(orderBy === 'amount' && order === 'asc' ? 'desc' : 'asc');
                      setOrderBy('amount');
                    }}
                  >Amount</TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'method'}
                    direction={orderBy === 'method' ? order : 'asc'}
                    onClick={() => {
                      setOrder(orderBy === 'method' && order === 'asc' ? 'desc' : 'asc');
                      setOrderBy('method');
                    }}
                  >Method</TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'note'}
                    direction={orderBy === 'note' ? order : 'asc'}
                    onClick={() => {
                      setOrder(orderBy === 'note' && order === 'asc' ? 'desc' : 'asc');
                      setOrderBy('note');
                    }}
                  >Note</TableSortLabel>
                </TableCell>
                <TableCell>
                  Invoice
                </TableCell>
                <TableCell>
                  Customer
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPayments.map(payment => (
                <TableRow key={payment._id}>
                  <TableCell>
                    {payment.date ? new Date(payment.date).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    ₹{payment.amount}
                  </TableCell>
                  <TableCell>
                    {payment.method}
                  </TableCell>
                  <TableCell>
                    {payment.note || ''}
                  </TableCell>
                  <TableCell>
                    {payment.invoice && payment.invoice._id 
                      ? String(payment.invoice._id).slice(-6).toUpperCase() 
                      : (payment.invoice ? String(payment.invoice).slice(-6).toUpperCase() : '')}
                  </TableCell>
                  <TableCell>
                    {payment.invoice && payment.invoice.customer && payment.invoice.customer.name
                      ? payment.invoice.customer.name
                      : ''}
                  </TableCell>
                  <TableCell>
                    {payment.invoice && payment.invoice.status 
                      ? payment.invoice.status.charAt(0).toUpperCase() + payment.invoice.status.slice(1)
                      : ''}
                  </TableCell>
                </TableRow>
              ))}
              {sortedPayments.length === 0 &&
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No payments found.
                  </TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
