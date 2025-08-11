import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

import {
  Box, Paper, Typography, TextField, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Snackbar, TableContainer, InputLabel, FormControl, Collapse, CircularProgress,
  Card, CardContent, Grid, Chip, IconButton, Tooltip, Divider, Alert
} from '@mui/material';
import { 
  Add, Remove, Edit, Delete, Person, Email, Phone, Business, 
  LocationOn, Description, Visibility, AddCircleOutline 
} from '@mui/icons-material';
import { useTheme } from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function CRM() {
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
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

  useEffect(() => { 
    loadCRM(); 
  }, []);

  useEffect(() => {
    if (location.state?.showForm) {
      setShowForm(true);
      
      if (location.state?.fromPage === 'sales') {
        setSnackbar({ 
          open: true, 
          message: 'Add new customer from sales', 
          severity: 'info' 
        });
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
    const res = await fetch(`${API_BASE_URL}/api/customers/${editForm._id}`, {
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

  const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    background: isDarkMode ? "#1a1a1a" : "#fafafa",
  },
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: isDarkMode ? "#0a0a0a" : "#fafafa",
        py: 4,
        px: 2,
      }}
    >
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 300,
              color: isDarkMode ? "#ffffff" : "#1a1a1a",
              mb: 1,
              letterSpacing: "-0.02em",
            }}
          >
            Customer Relationship Management
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 300, opacity: 0.7 }}
          >
            Manage your customer relationships and track leads
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid
          container
          spacing={3}
          sx={{
            mb: 6,
            justifyContent: "center",
            maxWidth: "1200px",
            margin: "0 auto 48px auto", // Centers horizontally with bottom margin
          }}
        >
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: isDarkMode ? "#1a1a1a" : "#ffffff",
                borderRadius: 2,
                boxShadow: isDarkMode
                  ? "0 2px 8px rgba(0,0,0,0.3)"
                  : "0 2px 8px rgba(0,0,0,0.08)",
                border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 300,
                    color: isDarkMode ? "#ffffff" : "#1a1a1a",
                    mb: 1,
                  }}
                >
                  {entries.length}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 400 }}
                >
                  Total Contacts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: isDarkMode ? "#1a1a1a" : "#ffffff",
                borderRadius: 2,
                boxShadow: isDarkMode
                  ? "0 2px 8px rgba(0,0,0,0.3)"
                  : "0 2px 8px rgba(0,0,0,0.08)",
                border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 300,
                    color: isDarkMode ? "#ffffff" : "#1a1a1a",
                    mb: 1,
                  }}
                >
                  {entries.filter((e) => e.status === "Lead").length}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 400 }}
                >
                  Active Leads
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: isDarkMode ? "#1a1a1a" : "#ffffff",
                borderRadius: 2,
                boxShadow: isDarkMode
                  ? "0 2px 8px rgba(0,0,0,0.3)"
                  : "0 2px 8px rgba(0,0,0,0.08)",
                border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 300,
                    color: isDarkMode ? "#ffffff" : "#1a1a1a",
                    mb: 1,
                  }}
                >
                  {entries.filter((e) => e.status === "Contacted").length}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 400 }}
                >
                  Contacted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: isDarkMode ? "#1a1a1a" : "#ffffff",
                borderRadius: 2,
                boxShadow: isDarkMode
                  ? "0 2px 8px rgba(0,0,0,0.3)"
                  : "0 2px 8px rgba(0,0,0,0.08)",
                border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 300,
                    color: isDarkMode ? "#ffffff" : "#1a1a1a",
                    mb: 1,
                  }}
                >
                  {entries.filter((e) => e.status === "Customer").length}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 400 }}
                >
                  Customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: isDarkMode
              ? "0 2px 8px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.08)",
            border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Form Toggle Button */}
            <Box
              sx={{
                p: 3,
                background: isDarkMode ? "#1a1a1a" : "#fafafa",
                borderBottom: `1px solid ${isDarkMode ? "#333" : "#e0e0e0"}`,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={() => setShowForm((prev) => !prev)}
                startIcon={showForm ? <Remove /> : <Add />}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 400,
                  borderColor: isDarkMode ? "#555" : "#ccc",
                  color: isDarkMode ? "#ffffff" : "#1a1a1a",
                  "&:hover": {
                    borderColor: isDarkMode ? "#777" : "#999",
                    background: isDarkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.02)",
                  },
                }}
              >
                {showForm ? "Hide Form" : "Add New Contact"}
              </Button>
            </Box>

            {/* Add Form */}
            <Collapse in={showForm}>
              <Box
                sx={{ p: 4, background: isDarkMode ? "#0f0f0f" : "#ffffff" }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 400,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AddCircleOutline sx={{ mr: 1, opacity: 0.7 }} />
                  Add New Contact
                </Typography>
                  
<Box component="form" onSubmit={handleSubmit}>
  <Grid container spacing={10}>
    {/* Personal Information */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        Personal Information
      </Typography>
    </Grid>
    <Grid item xs={12} md={4}>
      <TextField label="Full Name" id="name" value={form.name} onChange={handleChange} required fullWidth InputProps={{ startAdornment: (<Person sx={{ mr: 1, color: "text.secondary" }} />) }} sx={fieldStyle} />
    </Grid>
    <Grid item xs={12} md={4}>
      <TextField label="Email" id="email" value={form.email} onChange={handleChange} type="email" fullWidth InputProps={{ startAdornment: (<Email sx={{ mr: 1, color: "text.secondary" }} />) }} sx={fieldStyle} />
    </Grid>
    <Grid item xs={12} md={4}>
      <TextField label="Phone" id="phone" value={form.phone} onChange={handleChange} fullWidth InputProps={{ startAdornment: (<Phone sx={{ mr: 1, color: "text.secondary" }} />) }} sx={fieldStyle} />
    </Grid>



    {/* Business Information */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ fontWeight: 500, mt: 2, mb: 1 }}>
        Business Information
      </Typography>
    </Grid>
    <Grid item xs={12} md={4}>
      <TextField label="Company" id="company" value={form.company} onChange={handleChange} fullWidth InputProps={{ startAdornment: (<Business sx={{ mr: 1, color: "text.secondary" }} />) }} sx={fieldStyle} />
    </Grid>
    <Grid item xs={12} md={4}>
      <TextField label="GSTIN" id="gstIN" value={form.gstIN} onChange={handleChange} fullWidth sx={fieldStyle} />
    </Grid>
    <Grid item xs={12} md={4}>
      <FormControl fullWidth sx={fieldStyle}>
        <InputLabel>Status</InputLabel>
        <Select id="status" name="status" value={form.status} onChange={handleChange}>
          <MenuItem value="Lead">Lead</MenuItem>
          <MenuItem value="Contacted">Contacted</MenuItem>
          <MenuItem value="Customer">Customer</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    

    {/* Address */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ fontWeight: 500, mt: 2, mb: 1 }}>
        <LocationOn sx={{ mr: 1, fontSize: 20 }} /> Address
      </Typography>
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField label="Street" name="address.street" value={form.address.street} onChange={handleChange} fullWidth sx={fieldStyle} />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField label="City" name="address.city" value={form.address.city} onChange={handleChange} fullWidth sx={fieldStyle} />
    </Grid>
    <Grid item xs={12} md={4}>
      <TextField label="State" name="address.state" value={form.address.state} onChange={handleChange} fullWidth sx={fieldStyle} />
    </Grid>
    <Grid item xs={12} md={4}>
      <TextField label="ZIP Code" name="address.zip" value={form.address.zip} onChange={handleChange} fullWidth sx={fieldStyle} />
    </Grid>
    <Grid item xs={12} md={4}>
      <TextField label="Country" name="address.country" value={form.address.country} onChange={handleChange} fullWidth sx={fieldStyle} />
    </Grid>

    {/* Notes */}
    <Grid item xs={12}>
      <TextField label="Notes (optional)" id="notes" value={form.notes} onChange={handleChange} multiline rows={3} fullWidth InputProps={{ startAdornment: (<Description sx={{ mr: 1, color: "text.secondary", alignSelf: "flex-start", mt: 1 }} />) }} sx={fieldStyle} />
    </Grid>

    {/* Buttons */}
    <Grid item xs={12}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={() => setShowForm(false)}>Cancel</Button>
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
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 400,
                  display: "flex",
                  alignItems: "center",
                }}
              >
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
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    No contacts found
                  </Typography>
                  <Typography color="text.secondary">
                    Start by adding your first contact using the form above.
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          background: isDarkMode ? "#1a1a1a" : "#fafafa",
                        }}
                      >
                        {[
                          "Name",
                          "Contact",
                          "Company",
                          "Address",
                          "Status",
                          "Notes",
                          "Actions",
                        ].map((heading) => (
                          <TableCell
                            key={heading}
                            sx={{
                              color: isDarkMode ? "#ffffff" : "#1a1a1a",
                              fontWeight: 500,
                              borderBottom: "none",
                              fontSize: "0.875rem",
                            }}
                          >
                            {heading}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entries.map((item, index) => (
                        <TableRow
                          key={item._id}
                          sx={{
                            "&:hover": {
                              background: isDarkMode
                                ? "rgba(255,255,255,0.02)"
                                : "rgba(0,0,0,0.02)",
                            },
                            "&:nth-of-type(even)": {
                              background: isDarkMode
                                ? "rgba(255,255,255,0.01)"
                                : "rgba(0,0,0,0.01)",
                            },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Person
                                sx={{
                                  mr: 1,
                                  color: "text.secondary",
                                  opacity: 0.7,
                                }}
                              />
                              {item.name}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              {item.email && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 0.5,
                                  }}
                                >
                                  <Email
                                    sx={{
                                      mr: 1,
                                      fontSize: "small",
                                      color: "text.secondary",
                                      opacity: 0.7,
                                    }}
                                  />
                                  <Typography variant="body2">
                                    {item.email}
                                  </Typography>
                                </Box>
                              )}
                              {item.phone && (
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Phone
                                    sx={{
                                      mr: 1,
                                      fontSize: "small",
                                      color: "text.secondary",
                                      opacity: 0.7,
                                    }}
                                  />
                                  <Typography variant="body2">
                                    {item.phone}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {item.company ? (
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Business
                                  sx={{
                                    mr: 1,
                                    fontSize: "small",
                                    color: "text.secondary",
                                    opacity: 0.7,
                                  }}
                                />
                                {item.company}
                              </Box>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {item.address?.street || item.address?.city ? (
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <LocationOn
                                  sx={{
                                    mr: 1,
                                    fontSize: "small",
                                    color: "text.secondary",
                                    opacity: 0.7,
                                  }}
                                />
                                <Typography variant="body2">
                                  {[
                                    item.address?.street,
                                    item.address?.city,
                                    item.address?.state,
                                  ]
                                    .filter(Boolean)
                                    .join(", ") || "-"}
                                </Typography>
                              </Box>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              color={getStatusColor(item.status)}
                              size="small"
                              sx={{
                                fontWeight: 400,
                                background: isDarkMode ? "#333" : "#f0f0f0",
                                color: isDarkMode ? "#ffffff" : "#1a1a1a",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {item.notes ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 150,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.notes}
                              </Typography>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Edit Contact">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(item._id)}
                                  sx={{
                                    color: "text.secondary",
                                    "&:hover": {
                                      background: isDarkMode
                                        ? "rgba(255,255,255,0.05)"
                                        : "rgba(0,0,0,0.05)",
                                    },
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Contact">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(item._id)}
                                  sx={{
                                    color: "text.secondary",
                                    "&:hover": {
                                      background: isDarkMode
                                        ? "rgba(255,255,255,0.05)"
                                        : "rgba(0,0,0,0.05)",
                                    },
                                  }}
                                >
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
              )}
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
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: isDarkMode ? "#1a1a1a" : "#ffffff",
            border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: isDarkMode ? "#0f0f0f" : "#fafafa",
            color: isDarkMode ? "#ffffff" : "#1a1a1a",
            fontWeight: 400,
            borderBottom: `1px solid ${isDarkMode ? "#333" : "#e0e0e0"}`,
          }}
        >
          Edit Contact
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {editForm && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Name"
                  id="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <Person
                        sx={{ mr: 1, color: "text.secondary", opacity: 0.7 }}
                      />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  id="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <Email
                        sx={{ mr: 1, color: "text.secondary", opacity: 0.7 }}
                      />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  id="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <Phone
                        sx={{ mr: 1, color: "text.secondary", opacity: 0.7 }}
                      />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Company"
                  id="company"
                  value={editForm.company}
                  onChange={handleEditChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <Business
                        sx={{ mr: 1, color: "text.secondary", opacity: 0.7 }}
                      />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="GSTIN"
                  id="gstIN"
                  value={editForm.gstIN}
                  onChange={handleEditChange}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: isDarkMode ? "#1a1a1a" : "#fafafa",
                      },
                    }}
                  >
                    <MenuItem value="Lead">Lead</MenuItem>
                    <MenuItem value="Contacted">Contacted</MenuItem>
                    <MenuItem value="Customer">Customer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 400,
                    display: "flex",
                    alignItems: "center",
                    opacity: 0.8,
                  }}
                >
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="City"
                  name="address.city"
                  value={editForm.address?.city || ""}
                  onChange={handleEditChange}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="State"
                  name="address.state"
                  value={editForm.address?.state || ""}
                  onChange={handleEditChange}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="ZIP Code"
                  name="address.zip"
                  value={editForm.address?.zip || ""}
                  onChange={handleEditChange}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Country"
                  name="address.country"
                  value={editForm.address?.country || ""}
                  onChange={handleEditChange}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
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
                  InputProps={{
                    startAdornment: (
                      <Description
                        sx={{
                          mr: 1,
                          color: "text.secondary",
                          alignSelf: "flex-start",
                          mt: 1,
                          opacity: 0.7,
                        }}
                      />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: isDarkMode ? "#1a1a1a" : "#fafafa",
                    },
                  }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              borderColor: isDarkMode ? "#555" : "#ccc",
              color: isDarkMode ? "#ffffff" : "#1a1a1a",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            sx={{
              background: isDarkMode ? "#ffffff" : "#1a1a1a",
              color: isDarkMode ? "#1a1a1a" : "#ffffff",
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 400,
              "&:hover": {
                background: isDarkMode ? "#e0e0e0" : "#333333",
              },
            }}
          >
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
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
