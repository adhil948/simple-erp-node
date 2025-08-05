import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // Add this import
import {
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

import {
  Box, Paper, Typography, TextField, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Snackbar, TableContainer, InputLabel, FormControl, Collapse, CircularProgress
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useTheme } from '@mui/material';

export default function CRM() {
  const location = useLocation(); // Add this
  
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', gstIN: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
    status: 'Lead', notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showForm, setShowForm] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

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

  useEffect(() => { 
    loadCRM(); 
  }, []);

  // Add this useEffect to handle navigation state
  useEffect(() => {
    // Check if we were navigated here with showForm state
    if (location.state?.showForm) {
      setShowForm(true);
      
      // Optional: Show a message indicating we came from sales
      if (location.state?.fromPage === 'sales') {
        setSnackbar({ 
          open: true, 
          message: 'Add new customer from sales', 
          severity: 'info' 
        });
      }
      
      // Clear the state from browser history
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = e => {
    const { id, name, value } = e.target;

    if (name?.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [id || name]: value }));
    }
  };

  const handleEditChange = (e) => {
  const { name, id, value } = e.target;
  if (name?.startsWith('address.')) {
    const field = name.split('.')[1];
    setEditForm(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  } else {
    setEditForm(prev => ({
      ...prev,
      [id || name]: value
    }));
  }
};


const handleUpdate = async () => {
  const res = await fetch(`/api/customers/${editForm._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editForm)
  });
  if (res.ok) {
    setSnackbar({ open: true, message: 'Updated successfully!', severity: 'success' });
    setEditDialogOpen(false);
    setEditForm(null);
    loadCRM();
  } else {
    setSnackbar({ open: true, message: 'Error updating.', severity: 'error' });
  }
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
      setForm({
        name: '', email: '', phone: '', company: '', gstIN: '',
        address: { street: '', city: '', state: '', zip: '', country: '' },
        status: 'Lead', notes: ''
      });
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
  setEditForm(item);
  setEditDialogOpen(true);
};

  return (
    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1><strong>CRM MODULE</strong></h1>
      <Paper sx={{ p: 3, mb: 3, width: '100%', maxWidth: 1000 }} elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 1600, mb: 3 }}>
            <TextField label="Full Name" id="name" value={form.name} onChange={handleChange} required fullWidth />
            <TextField label="Email" id="email" value={form.email} onChange={handleChange} type="email" fullWidth />
            <TextField label="Phone" id="phone" value={form.phone} onChange={handleChange} fullWidth />
            <TextField label="Company" id="company" value={form.company} onChange={handleChange} fullWidth />
            <TextField label="GSTIN" id="gstIN" value={form.gstIN} onChange={handleChange} fullWidth />
            <TextField label="Street" name="address.street" value={form.address.street} onChange={handleChange} fullWidth />
            <TextField label="City" name="address.city" value={form.address.city} onChange={handleChange} fullWidth />
            <TextField label="State" name="address.state" value={form.address.state} onChange={handleChange} fullWidth />
            <TextField label="ZIP Code" name="address.zip" value={form.address.zip} onChange={handleChange} fullWidth />
            <TextField label="Country" name="address.country" value={form.address.country} onChange={handleChange} fullWidth />
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
              <Button type="submit" variant="contained" disabled={submitting}>
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
                <TableRow sx={{ bgcolor: isDarkMode ? '#1e1e1e' : '#f0f0f0' }}>
                  {['Name', 'Email', 'Phone', 'Company', 'GSTIN', 'Address', 'Status', 'Notes', 'Actions'].map((heading) => (
                    <TableCell key={heading} sx={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>
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
                    <TableCell>{item.gstIN || '-'}</TableCell>
                    <TableCell>
                      {[item.address?.street, item.address?.city, item.address?.state, item.address?.zip, item.address?.country]
                        .filter(Boolean).join(', ') || '-'}
                    </TableCell>
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

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Edit CRM Entry</DialogTitle>
  <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
    {editForm && (
      <>
        <TextField label="Name" id="name" value={editForm.name} onChange={handleEditChange} fullWidth />
        <TextField label="Email" id="email" value={editForm.email} onChange={handleEditChange} fullWidth />
        <TextField label="Phone" id="phone" value={editForm.phone} onChange={handleEditChange} fullWidth />
        <TextField label="Company" id="company" value={editForm.company} onChange={handleEditChange} fullWidth />
        <TextField label="GSTIN" id="gstIN" value={editForm.gstIN} onChange={handleEditChange} fullWidth />
        <TextField label="Street" name="address.street" value={editForm.address?.street || ''} onChange={handleEditChange} fullWidth />
        <TextField label="City" name="address.city" value={editForm.address?.city || ''} onChange={handleEditChange} fullWidth />
        <TextField label="State" name="address.state" value={editForm.address?.state || ''} onChange={handleEditChange} fullWidth />
        <TextField label="ZIP Code" name="address.zip" value={editForm.address?.zip || ''} onChange={handleEditChange} fullWidth />
        <TextField label="Country" name="address.country" value={editForm.address?.country || ''} onChange={handleEditChange} fullWidth />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            id="status"
            name="status"
            value={editForm.status}
            label="Status"
            onChange={handleEditChange}
          >
            <MenuItem value="Lead">Lead</MenuItem>
            <MenuItem value="Contacted">Contacted</MenuItem>
            <MenuItem value="Customer">Customer</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Notes" id="notes" value={editForm.notes} onChange={handleEditChange} multiline rows={2} fullWidth />
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditDialogOpen(false)} color="secondary">Cancel</Button>
    <Button onClick={handleUpdate} variant="contained">Save</Button>
  </DialogActions>
</Dialog>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
