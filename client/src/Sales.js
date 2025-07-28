import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Snackbar, TableContainer, InputLabel, FormControl
} from '@mui/material';

export default function Sales() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [form, setForm] = useState({ customerName: '', status: 'paid' });
  const [item, setItem] = useState({ productName: '', quantity: '', price: '' });
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadSales();
  }, []);

  const loadCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    setCustomers(data);
  };

  const loadProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    console.log(`products`,data);
    const map = {};
    data.forEach(p => { map[p.name] = p.price; });
    setProductMap(map);
  };

  const loadSales = async () => {
    const res = await fetch('/api/sales');
    const data = await res.json();
    setSales(data);
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.id || e.target.name]: e.target.value });
  };

  const handleItemChange = e => {
    console.log(`handleitemchange`)
    const {name, value} = e.target;
    console.log(`value`,value)
    if (name === 'productName') {
      setItem({ ...item, productName: value, price: productMap[value] || '' });
      console.log(`true`);
    } else {
      setItem({ ...item, [e.target.id]: value });
      console.log(`false`);
    }
  };

  const addItem = e => {
    e.preventDefault();
    if (!item.productName || !item.quantity || !item.price) {
      setSnackbar({ open: true, message: 'Please select product, quantity, and price.', severity: 'error' });
      return;
    }
    setItems([...items, { ...item, quantity: parseInt(item.quantity), price: parseFloat(item.price) }]);
    setItem({ productName: '', quantity: '', price: '' });
  };

  const removeItem = idx => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!items.length) {
      setSnackbar({ open: true, message: 'Add at least one item to the sale.', severity: 'error' });
      return;
    }
    const sale = {
      customerName: form.customerName,
      items,
      totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      status: form.status
    };
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale)
    });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Sale added!', severity: 'success' });
      setForm({ customerName: '', status: 'paid' });
      setItems([]);
      loadSales();
    } else {
      setSnackbar({ open: true, message: 'Error adding sale.', severity: 'error' });
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this sale?')) return;
    const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Sale deleted', severity: 'success' });
      loadSales();
    } else {
      setSnackbar({ open: true, message: 'Error deleting sale', severity: 'error' });
    }
  };

  const handleEdit = async id => {
    const saleres = await fetch(`/api/sales/${id}`);
    const sale = await saleres.json();
    const newCustomer = prompt('Edit customer name:', sale.customerName);
    const newProduct = prompt('Edit product name:', sale.items[0].productName);
    const newQty = prompt('Edit quantity:', sale.items[0].quantity);
    const newPrice = prompt('Edit price:', sale.items[0].price);
    const newStatus = prompt('Edit status (Paid, Unpaid, Pending):', sale.status);
    if (!newCustomer || !newProduct || !newQty || !newPrice || !newStatus) {
      setSnackbar({ open: true, message: 'All fields are required.', severity: 'error' });
      return;
    }
    const updated = {
      customerName: newCustomer,
      items: [{ productName: newProduct, quantity: parseInt(newQty), price: parseFloat(newPrice) }],
      totalAmount: parseInt(newQty) * parseFloat(newPrice),
      status: newStatus
    };
    const res = await fetch(`/api/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Sale updated!', severity: 'success' });
      loadSales();
    } else {
      setSnackbar({ open: true, message: 'Error updating sale.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ mt: 4 }} justifyContent="center">
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Typography variant="h4" gutterBottom align="center">Sales Module</Typography>
        <Typography variant="h6" gutterBottom align="center">Add New Sale</Typography>
        <Box component="form" id="saleForm" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 6000 }} justifyContent="center">
          <FormControl>
            <InputLabel id="customerName-label">Customer</InputLabel>
            <Select
              labelId="customerName-label"
              id="customerName"
              name="customerName"
              value={form.customerName}
              label="Customer"
              onChange={handleFormChange}
              required
            >
              <MenuItem value="">-- Select Customer --</MenuItem>
              {customers.map(c => (
                <MenuItem key={c._id} value={c.name}>{c.name}{c.company ? ` (${c.company})` : ''}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box id="itemInputs" sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 350 }}>
              <InputLabel id="productName-label">Product</InputLabel>
              <Select
                labelId="productName-label"
                id="productName"
                name="productName"
                value={item.productName}
                label="Product"
                onChange={handleItemChange}
              >
                <MenuItem value="">-- Select Product --</MenuItem>
                {products.map(p => (
                  <MenuItem key={p._id} value={p.name}>{p.name} (₹{p.price})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Quantity" id="quantity" value={item.quantity} onChange={handleItemChange} type="number" sx={{ width: 200 }} />
            <TextField label="Price" id="price" value={item.price} InputProps={{ readOnly: true }} sx={{ width: 300 }} />
            <Button sx={{width:200}} type="button" variant="outlined" onClick={addItem}>Add Item</Button>
          </Box>
          {items.length > 0 && (
            <TableContainer sx={{ mt: 2 }}>
              <Table id="itemsTable">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Subtotal</TableCell>
                    <TableCell>Remove</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{it.productName}</TableCell>
                      <TableCell>{it.quantity}</TableCell>
                      <TableCell>{it.price}</TableCell>
                      <TableCell>{it.quantity * it.price}</TableCell>
                      <TableCell><Button type="button" color="error" onClick={() => removeItem(idx)}>Remove</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <FormControl>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={form.status}
              label="Status"
              onChange={handleFormChange}
            >
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="unpaid">Unpaid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained">Add Sale</Button>
        </Box>
      </Paper>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h6" gutterBottom>All Sales</Typography>
        <TableContainer>
          <Table id="salesTable">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map(sale => (
                <TableRow key={sale._id}>
                  <TableCell>{sale.customerName}</TableCell>
                  <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{sale.items.map(item => <div key={item.productName}>{item.productName} (x{item.quantity} @ {item.price})</div>)}</TableCell>
                  <TableCell>{sale.items.map(i => i.quantity).join(', ')}</TableCell>
                  <TableCell>{sale.items.map(i => i.price).join(', ')}</TableCell>
                  <TableCell>{sale.totalAmount}</TableCell>
                  <TableCell>{sale.status}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" color="primary" onClick={() => handleEdit(sale._id)} sx={{ mr: 1 }}>Edit</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(sale._id)}>Delete</Button>
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