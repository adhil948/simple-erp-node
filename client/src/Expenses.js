import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Snackbar, TableContainer, InputLabel, FormControl,
  Collapse, 
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', amount: '', date: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filter,setFilter] = useState({ category: '', date: '' ,month: ''});
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let result = [...expenses];
    if (filter.category){
      result = result.filter(exp => exp.category === filter.category);
    }

  if (filter.month) {
    result = result.filter(exp => {
      const expDate = new Date(exp.date);
      const filterMonth = new Date(filter.month + '-01'); // e.g., "2025-07"
      return (
        expDate.getFullYear() === filterMonth.getFullYear() &&
        expDate.getMonth() === filterMonth.getMonth()
      );
    });
  } else if (filter.date) {
    result = result.filter(exp => exp.date.slice(0, 10) === filter.date);
  }
    setFilteredExpenses(result);
  }, [expenses, filter]);


  const handleFilterChange =(e)=> {
    setFilter({...filter, [e.target.name]: e.target.value });
  }

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

  const handleEdit = id => {
    const exp = expenses.find(e => e._id === id);
    if (exp) {
      setForm({
        name: exp.name,
        category: exp.category,
        amount: exp.amount.toString(),
        date: exp.date.slice(0, 10)
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  return (
    <Box sx={{ mt: 1}}>
      <h1 gutterBottom align="center">Expense Tracker</h1>
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>

          <Button
                    variant="contained"
                    color={showForm ? 'secondary' : 'primary'}
                    onClick={() => setShowForm(prev => !prev)}
                    startIcon={showForm ? <Remove /> : <Add />}
                  >
                    {showForm ? 'Hide Form' : 'Add New lead'}
                  </Button>

          <Collapse in={showForm}>
        <Box component="form" id="expenseForm" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 1200 }}>
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
        </Collapse>
        
      </Paper>
<Paper sx={{ p: 2, mb: 3 }} elevation={20}>
  <Typography variant="h6" gutterBottom>Filter Expenses</Typography>
  <Box
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: 2,
        alignItems: 'center',
        width: '100%',
        '& > *': { flex: 1 }
      }}
    >    <FormControl sx={{ minWidth: 300 }}>
      <InputLabel id="filter-category-label">Category</InputLabel>
      <Select
        labelId="filter-category-label"
        name="category"
        value={filter.category}
        onChange={handleFilterChange}
        label="Category"
      >
        <MenuItem value="">All Categories</MenuItem>
        <MenuItem value="Utility">Utility</MenuItem>
        <MenuItem value="Salary">Salary</MenuItem>
        <MenuItem value="Purchase">Purchase</MenuItem>
        <MenuItem value="Maintenance">Maintenance</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </Select>
    </FormControl>

    <TextField
      name="date"
      label="Specific Date"
      type="date"
      value={filter.date}
      onChange={handleFilterChange}
      InputLabelProps={{ shrink: true }}
    />

    <TextField
      name="month"
      label="Month"
      type="month"
      value={filter.month}
      onChange={handleFilterChange}
      InputLabelProps={{ shrink: true }}
    />

    <Button
      variant="outlined"
      color="secondary"
      onClick={() => setFilter({ category: '', date: '', month: '' })}
    >
      Clear Filters
    </Button>
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
              {filteredExpenses.map(exp => (
                <TableRow key={exp._id}>
                  <TableCell>{exp.name}</TableCell>
                  <TableCell>{exp.category}</TableCell>
                  <TableCell>₹{exp.amount}</TableCell>
                  <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(exp._id)}>Delete</Button>
                    <Button size="small" variant="outlined" color="blue" onClick={() => handleEdit(exp._id)}>Edit</Button>
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