import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Snackbar, TableContainer, InputLabel, FormControl, Collapse, IconButton, CircularProgress
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import {
       
  useTheme
} from '@mui/material';

export default function CRM() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', status: 'Lead', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showForm, setShowForm] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';


  const loadCRM = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setEntries(data);
    } catch {
      setSnackbar({ open: true, message: 'Error loading CRM data.', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => { loadCRM(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.id || e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
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
    setSubmitting(false);
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
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper sx={{ p: 3, mb: 3, width: '100%', maxWidth: 1000 }} elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">👥 CRM Module</Typography>
          <Button
            variant="contained"
            color={showForm ? 'secondary' : 'primary'}
            onClick={() => setShowForm(prev => !prev)}
            startIcon={showForm ? <Remove /> : <Add />}
          >
            {showForm ? 'Hide Form' : 'Add New lead'}
          </Button>
        </Box>

        <Collapse in={showForm}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              maxWidth: 600,
              mb: 3
            }}
          >
            <TextField label="Full Name" id="name" value={form.name} onChange={handleChange} required fullWidth />
            <TextField label="Email" id="email" value={form.email} onChange={handleChange} type="email" fullWidth />
            <TextField label="Phone" id="phone" value={form.phone} onChange={handleChange} fullWidth />
            <TextField label="Company" id="company" value={form.company} onChange={handleChange} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={form.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="Lead">Lead</MenuItem>
                <MenuItem value="Contacted">Contacted</MenuItem>
                <MenuItem value="Customer">Customer</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Notes (optional)" id="notes" value={form.notes} onChange={handleChange} multiline rows={2} fullWidth />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Add CRM Entry'}
              </Button>
            </Box>
          </Box>
        </Collapse>

        <Typography variant="h6" gutterBottom>All CRM Entries</Typography>
        {loading ? (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <CircularProgress />
            <Typography>Loading CRM data...</Typography>
          </Box>
        ) : (
<TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table id="crmTable">
        <TableHead>
          <TableRow
            sx={{
              bgcolor: isDarkMode ? '#1e1e1e' : '#f0f0f0',
            }}
          >
            {['Name', 'Email', 'Phone', 'Company', 'Status', 'Notes', 'Actions'].map((heading) => (
              <TableCell
                key={heading}
                sx={{
                  color: isDarkMode ? '#ffffff' : '#000000',
                  fontWeight: 'bold',
                }}
              >
                {heading}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {entries.map(item => (
            <TableRow key={item._id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.email || '-'}</TableCell>
              <TableCell>{item.phone || '-'}</TableCell>
              <TableCell>{item.company || '-'}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.notes || '-'}</TableCell>
              <TableCell>
                <Button size="small" variant="outlined" onClick={() => handleEdit(item._id)} sx={{ mr: 1 }}>Edit</Button>
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
