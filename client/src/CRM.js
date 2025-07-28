import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Snackbar, TableContainer, InputLabel, FormControl
} from '@mui/material';

export default function CRM() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', status: 'Lead', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadCRM = async () => {
    setLoading(true);
    const res = await fetch('/api/customers');
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => { loadCRM(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.id || e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Entry added!', severity: 'success' });
      setForm({ name: '', email: '', phone: '', company: '', status: 'Lead', notes: '' });
      loadCRM();
    } else {
      setSnackbar({ open: true, message: 'Error adding entry.', severity: 'error' });
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this entry?')) return;
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Deleted!', severity: 'success' });
      loadCRM();
    } else {
      setSnackbar({ open: true, message: 'Failed to delete.', severity: 'error' });
    }
  };

  const handleEdit = async id => {
    const res = await fetch(`/api/customers/${id}`);
    const item = await res.json();
    // For simplicity, still use prompt for now, but you can replace with a dialog later
    const name = prompt('Edit name:', item.name);
    const email = prompt('Edit email:', item.email);
    const phone = prompt('Edit phone:', item.phone);
    const company = prompt('Edit company:', item.company);
    const status = prompt('Edit status (Lead/Contacted/Customer):', item.status);
    const notes = prompt('Edit notes:', item.notes);
    const updated = { name, email, phone, company, status, notes };
    const updateRes = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (updateRes.ok) {
      setSnackbar({ open: true, message: 'Updated!', severity: 'success' });
      loadCRM();
    } else {
      setSnackbar({ open: true, message: 'Error updating.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Typography variant="h4" gutterBottom>CRM Module</Typography>
        <Typography variant="h6" gutterBottom>Add New Lead/Customer</Typography>
        <Box component="form" id="crmForm" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
          <TextField label="Full Name" id="name" value={form.name} onChange={handleChange} required />
          <TextField label="Email" id="email" value={form.email} onChange={handleChange} type="email" />
          <TextField label="Phone" id="phone" value={form.phone} onChange={handleChange} />
          <TextField label="Company" id="company" value={form.company} onChange={handleChange} />
          <FormControl>
            <InputLabel id="status-label">Status</InputLabel>
            <Select labelId="status-label" id="status" name="status" value={form.status} label="Status" onChange={handleChange}>
              <MenuItem value="Lead">Lead</MenuItem>
              <MenuItem value="Contacted">Contacted</MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Notes (optional)" id="notes" value={form.notes} onChange={handleChange} multiline rows={2} />
          <Button type="submit" variant="contained">Add CRM Entry</Button>
        </Box>
      </Paper>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h6" gutterBottom>All CRM Entries</Typography>
        {loading ? <Typography>Loading...</Typography> : (
          <TableContainer>
            <Table id="crmTable">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map(item => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email || ''}</TableCell>
                    <TableCell>{item.phone || ''}</TableCell>
                    <TableCell>{item.company || ''}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.notes || ''}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color="primary" onClick={() => handleEdit(item._id)} sx={{ mr: 1 }}>Edit</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(item._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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