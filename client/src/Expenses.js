import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Snackbar, TableContainer, InputLabel, FormControl
} from '@mui/material';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', amount: '', date: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadExpenses = async () => {
    const res = await fetch('/api/expenses');
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => { loadExpenses(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.id || e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const expense = {
      name: form.name,
      category: form.category,
      amount: parseFloat(form.amount),
      date: form.date
    };
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Expense added!', severity: 'success' });
      setForm({ name: '', category: '', amount: '', date: '' });
      loadExpenses();
    } else {
      setSnackbar({ open: true, message: 'Failed to add expense', severity: 'error' });
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Expense deleted!', severity: 'success' });
      loadExpenses();
    } else {
      setSnackbar({ open: true, message: 'Failed to delete expense', severity: 'error' });
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Typography variant="h4" gutterBottom>Expense Tracker</Typography>
        <Box component="form" id="expenseForm" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
          <TextField label="Expense Name" id="name" value={form.name} onChange={handleChange} required />
          <FormControl>
            <InputLabel id="category-label">Category</InputLabel>
            <Select labelId="category-label" id="category" name="category" value={form.category} label="Category" onChange={handleChange} required>
              <MenuItem value="">-- Select Category --</MenuItem>
              <MenuItem value="Utility">Utility</MenuItem>
              <MenuItem value="Salary">Salary</MenuItem>
              <MenuItem value="Purchase">Purchase</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Amount (₹)" id="amount" value={form.amount} onChange={handleChange} type="number" required />
          <TextField label="Date" id="date" value={form.date} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }} required />
          <Button type="submit" variant="contained">Add Expense</Button>
        </Box>
      </Paper>
      <Paper sx={{ p: 3 }} elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount (₹)</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map(exp => (
                <TableRow key={exp._id}>
                  <TableCell>{exp.name}</TableCell>
                  <TableCell>{exp.category}</TableCell>
                  <TableCell>₹{exp.amount}</TableCell>
                  <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(exp._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
} 