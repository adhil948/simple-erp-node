import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Box, Typography, TextField, Select, MenuItem, Button, Table, TableHead, 
  TableRow, TableCell, TableBody, Snackbar, TableContainer, FormControl, 
  Collapse, CircularProgress, Card, CardContent, Grid, Chip, IconButton, 
  Tooltip, Divider, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  InputLabel, InputAdornment, useMediaQuery, useTheme
} from '@mui/material';
import { 
  Add, Remove, Edit, Delete, Person, Email, Phone, Business, 
  LocationOn, Description, Visibility, AddCircleOutline 
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function CRM() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';
  const location = useLocation();
  
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const loadCRM = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`);
      const data = await res.json();
      setEntries(data);
    } catch {
      setSnackbar({ open: true, message: 'Error loading CRM data.', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => { loadCRM(); }, []);

  useEffect(() => {
    if (location.state?.showForm) {
      setShowForm(true);
      if (location.state?.fromPage === 'sales') {
        setSnackbar({ open: true, message: 'Add new customer from sales', severity: 'info' });
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = e => {
    const { id, name, value } = e.target;
    if (name?.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
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
      setEditForm(prev => ({ ...prev, [id || name]: value }));
    }
  };

  const handleUpdate = async () => {
    const res = await fetch(`${API_BASE_URL}/api/customers/${editForm._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Updated successfully!', severity: 'success' });
      setEditDialogOpen(false);
      loadCRM();
    } else {
      setSnackbar({ open: true, message: 'Error updating.', severity: 'error' });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`${API_BASE_URL}/api/customers`, {
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
    const res = await fetch(`${API_BASE_URL}/api/customers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Deleted!', severity: 'success' });
      loadCRM();
    } else {
      setSnackbar({ open: true, message: 'Failed to delete.', severity: 'error' });
    }
  };

  const handleEdit = async id => {
    const res = await fetch(`${API_BASE_URL}/api/customers/${id}`);
    const item = await res.json();
    setEditForm(item);
    setEditDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Lead': return 'default';
      case 'Contacted': return 'primary';
      case 'Customer': return 'success';
      default: return 'default';
    }
  };

  const cardStyle = {
    background: isDarkMode ? "#1a1a1a" : "#ffffff",
    borderRadius: 2,
    boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
    border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      background: isDarkMode ? "#1a1a1a" : "#fafafa",
    },
  };

  const renderMobileTable = () => (
    <Box sx={{ mt: 2 }}>
      {entries.map((item) => (
        <Card key={item._id} sx={{ ...cardStyle, mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {item.name}
              </Typography>
              <Chip
                label={item.status}
                color={getStatusColor(item.status)}
                size="small"
                sx={{ fontWeight: 400 }}
              />
            </Box>
            
            {item.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, fontSize: 'small', opacity: 0.7 }} />
                <Typography variant="body2">{item.email}</Typography>
              </Box>
            )}
            
            {item.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ mr: 1, fontSize: 'small', opacity: 0.7 }} />
                <Typography variant="body2">{item.phone}</Typography>
              </Box>
            )}
            
            {item.company && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Business sx={{ mr: 1, fontSize: 'small', opacity: 0.7 }} />
                <Typography variant="body2">{item.company}</Typography>
              </Box>
            )}
            
            {(item.address?.street || item.address?.city) && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <LocationOn sx={{ mr: 1, fontSize: 'small', opacity: 0.7, mt: 0.5 }} />
                <Typography variant="body2">
                  {[item.address?.street, item.address?.city].filter(Boolean).join(', ')}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <IconButton size="small" onClick={() => handleEdit(item._id)}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(item._id)}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopTable = () => (
    <TableContainer sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ background: isDarkMode ? "#1a1a1a" : "#fafafa" }}>
            {["Name", "Contact", "Company", "Address", "Status", "Notes", "Actions"].map((heading) => (
              <TableCell key={heading} sx={{ fontWeight: 500, borderBottom: "none" }}>
                {heading}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((item) => (
            <TableRow key={item._id} hover>
              <TableCell sx={{ fontWeight: 500 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Person sx={{ mr: 1, opacity: 0.7 }} />
                  {item.name}
                </Box>
              </TableCell>
              <TableCell>
                {item.email && (
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Email sx={{ mr: 1, fontSize: "small", opacity: 0.7 }} />
                    <Typography variant="body2">{item.email}</Typography>
                  </Box>
                )}
                {item.phone && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Phone sx={{ mr: 1, fontSize: "small", opacity: 0.7 }} />
                    <Typography variant="body2">{item.phone}</Typography>
                  </Box>
                )}
              </TableCell>
              <TableCell>
                {item.company ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Business sx={{ mr: 1, fontSize: "small", opacity: 0.7 }} />
                    {item.company}
                  </Box>
                ) : "-"}
              </TableCell>
              <TableCell>
                {(item.address?.street || item.address?.city) ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LocationOn sx={{ mr: 1, fontSize: "small", opacity: 0.7 }} />
                    <Typography variant="body2">
                      {[item.address?.street, item.address?.city].filter(Boolean).join(", ")}
                    </Typography>
                  </Box>
                ) : "-"}
              </TableCell>
              <TableCell>
                <Chip
                  label={item.status}
                  color={getStatusColor(item.status)}
                  size="small"
                  sx={{ fontWeight: 400 }}
                />
              </TableCell>
              <TableCell>
                {item.notes ? (
                  <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                    {item.notes}
                  </Typography>
                ) : "-"}
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleEdit(item._id)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDelete(item._id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ minHeight: "100vh", background: isDarkMode ? "#0a0a0a" : "#fafafa", p: isMobile ? 1 : 3 }}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: isMobile ? 3 : 6 }}>
          <Typography variant={isMobile ? "h4" : "h3"} component="h1" sx={{ fontWeight: 300, mb: 1 }}>
            Customer Relationship Management
          </Typography>
          <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ fontWeight: 300 }}>
            Manage your customer relationships and track leads
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: isMobile ? 3 : 6 }}>
          {[
            { label: "Total Contacts", value: entries.length },
            { label: "Active Leads", value: entries.filter(e => e.status === "Lead").length },
            { label: "Contacted", value: entries.filter(e => e.status === "Contacted").length },
            { label: "Customers", value: entries.filter(e => e.status === "Customer").length }
          ].map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Card sx={cardStyle}>
                <CardContent sx={{ textAlign: "center", py: isMobile ? 2 : 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 300, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Card sx={cardStyle}>
          <CardContent sx={{ p: 0 }}>
            {/* Form Toggle Button */}
            <Box sx={{ p: isMobile ? 2 : 3, borderBottom: `1px solid ${isDarkMode ? "#333" : "#e0e0e0"}` }}>
              <Button
                variant="outlined"
                size={isMobile ? "medium" : "large"}
                onClick={() => setShowForm(prev => !prev)}
                startIcon={showForm ? <Remove /> : <Add />}
                fullWidth={isMobile}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  textTransform: "none",
                  fontWeight: 400
                }}
              >
                {showForm ? "Hide Form" : "Add New Contact"}
              </Button>
            </Box>

            {/* Add Form */}
            <Collapse in={showForm}>
              <Box sx={{ p: isMobile ? 2 : 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
                  <AddCircleOutline sx={{ mr: 1, opacity: 0.7 }} />
                  Add New Contact
                </Typography>
                  
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={isMobile ? 1 : 3}>
                    {/* Personal Information */}
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Personal Information
                        </Typography>
                        <Grid container spacing={isMobile ? 1 : 2}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="Full Name"
                              id="name"
                              value={form.name}
                              onChange={handleChange}
                              required
                              fullWidth
                              InputProps={{ startAdornment: <Person color="action" /> }}
                              sx={inputStyle}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="Email"
                              id="email"
                              value={form.email}
                              onChange={handleChange}
                              type="email"
                              fullWidth
                              InputProps={{ startAdornment: <Email color="action" /> }}
                              sx={inputStyle}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="Phone"
                              id="phone"
                              value={form.phone}
                              onChange={handleChange}
                              fullWidth
                              InputProps={{ startAdornment: <Phone color="action" /> }}
                              sx={inputStyle}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Business Information */}
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Business Information
                        </Typography>
                        <Grid container spacing={isMobile ? 1 : 2}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              label="Company"
                              id="company"
                              value={form.company}
                              onChange={handleChange}
                              fullWidth
                              InputProps={{ startAdornment: <Business color="action" /> }}
                              sx={inputStyle}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField 
                              label="GSTIN" 
                              id="gstIN" 
                              value={form.gstIN} 
                              onChange={handleChange} 
                              fullWidth 
                              sx={inputStyle} 
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                              <InputLabel>Status</InputLabel>
                              <Select 
                                id="status" 
                                name="status" 
                                value={form.status} 
                                onChange={handleChange}
                                sx={inputStyle}
                              >
                                <MenuItem value="Lead">Lead</MenuItem>
                                <MenuItem value="Contacted">Contacted</MenuItem>
                                <MenuItem value="Customer">Customer</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Address */}
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Address
                        </Typography>
                        <Grid container spacing={isMobile ? 1 : 2}>
                          <Grid item xs={12} md={6}>
                            <TextField 
                              label="Street" 
                              name="address.street" 
                              value={form.address.street} 
                              onChange={handleChange} 
                              fullWidth 
                              sx={inputStyle} 
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField 
                              label="City" 
                              name="address.city" 
                              value={form.address.city} 
                              onChange={handleChange} 
                              fullWidth 
                              sx={inputStyle} 
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField 
                              label="State" 
                              name="address.state" 
                              value={form.address.state} 
                              onChange={handleChange} 
                              fullWidth 
                              sx={inputStyle} 
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField 
                              label="ZIP Code" 
                              name="address.zip" 
                              value={form.address.zip} 
                              onChange={handleChange} 
                              fullWidth 
                              sx={inputStyle} 
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField 
                              label="Country" 
                              name="address.country" 
                              value={form.address.country} 
                              onChange={handleChange} 
                              fullWidth 
                              sx={inputStyle} 
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    {/* Notes */}
                    <Grid item xs={12}>
                      <TextField
                        label="Notes (optional)"
                        id="notes"
                        value={form.notes}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        fullWidth
                        InputProps={{ startAdornment: <Description color="action" /> }}
                        sx={inputStyle}
                      />
                    </Grid>

                    {/* Buttons */}
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" onClick={() => setShowForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={submitting}>
                          {submitting ? "Adding..." : "Add Contact"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Collapse>

            <Divider />

            {/* Data Table */}
            <Box sx={{ p: isMobile ? 1 : 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
                <Visibility sx={{ mr: 1, opacity: 0.7 }} />
                All Contacts ({entries.length})
              </Typography>

              {loading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress size={60} />
                  <Typography sx={{ mt: 2, color: "text.secondary" }}>
                    Loading CRM data...
                  </Typography>
                </Box>
              ) : entries.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No contacts found
                  </Typography>
                  <Typography color="text.secondary">
                    Start by adding your first contact using the form above.
                  </Typography>
                </Box>
              ) : isMobile ? renderMobileTable() : renderDesktopTable()}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: cardStyle }}
      >
        <DialogTitle sx={{ fontWeight: 400 }}>
          Edit Contact
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 1 : 3 }}>
          {editForm && (
            <Grid container spacing={isMobile ? 1 : 3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Name"
                  id="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  fullWidth
                  InputProps={{ startAdornment: <Person sx={{ mr: 1, opacity: 0.7 }} /> }}
                  sx={inputStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  id="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  fullWidth
                  InputProps={{ startAdornment: <Email sx={{ mr: 1, opacity: 0.7 }} /> }}
                  sx={inputStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  id="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  fullWidth
                  InputProps={{ startAdornment: <Phone sx={{ mr: 1, opacity: 0.7 }} /> }}
                  sx={inputStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Company"
                  id="company"
                  value={editForm.company}
                  onChange={handleEditChange}
                  fullWidth
                  InputProps={{ startAdornment: <Business sx={{ mr: 1, opacity: 0.7 }} /> }}
                  sx={inputStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="GSTIN"
                  id="gstIN"
                  value={editForm.gstIN}
                  onChange={handleEditChange}
                  fullWidth
                  sx={inputStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    id="status"
                    name="status"
                    value={editForm.status}
                    label="Status"
                    onChange={handleEditChange}
                    sx={inputStyle}
                  >
                    <MenuItem value="Lead">Lead</MenuItem>
                    <MenuItem value="Contacted">Contacted</MenuItem>
                    <MenuItem value="Customer">Customer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 400 }}>
                  <LocationOn sx={{ mr: 1 }} />
                  Address Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Street"
                  name="address.street"
                  value={editForm.address?.street || ""}
                  onChange={handleEditChange}
                  fullWidth
                  sx={inputStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="City"
                  name="address.city"
                  value={editForm.address?.city || ""}
                  onChange={handleEditChange}
                  fullWidth
                  sx={inputStyle}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="State"
                  name="address.state"
                  value={editForm.address?.state || ""}
                  onChange={handleEditChange}
                  fullWidth
                  sx={inputStyle}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="ZIP Code"
                  name="address.zip"
                  value={editForm.address?.zip || ""}
                  onChange={handleEditChange}
                  fullWidth
                  sx={inputStyle}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Country"
                  name="address.country"
                  value={editForm.address?.country || ""}
                  onChange={handleEditChange}
                  fullWidth
                  sx={inputStyle}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  id="notes"
                  value={editForm.notes}
                  onChange={handleEditChange}
                  multiline
                  rows={3}
                  fullWidth
                  InputProps={{ startAdornment: <Description sx={{ mr: 1, mt: 1, opacity: 0.7 }} /> }}
                  sx={inputStyle}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}