import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Snackbar, TableContainer, InputLabel, FormControl
} from '@mui/material';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', quantity: '', price: '', category: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.id || e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const product = {
      name: form.name,
      sku: form.sku,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      category: form.category
    };
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Product added!', severity: 'success' });
      setForm({ name: '', sku: '', quantity: '', price: '', category: '' });
      loadProducts();
    } else {
      const err = await res.json();
      setSnackbar({ open: true, message: 'Error: ' + (err.error || 'Failed to add product'), severity: 'error' });
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Deleted!', severity: 'success' });
      loadProducts();
    } else {
      setSnackbar({ open: true, message: 'Failed to delete.', severity: 'error' });
    }
  };

  const handleEdit = async id => {
    const res = await fetch(`/api/products/${id}`);
    const product = await res.json();
    const newName = prompt('Edit name:', product.name);
    const newQty = prompt('Edit quantity:', product.quantity);
    const newPrice = prompt('Edit price:', product.price);
    const newCat = prompt('Edit category:', product.category);
    const updated = {
      name: newName,
      quantity: parseInt(newQty),
      price: parseFloat(newPrice),
      category: newCat,
      sku: product.sku
    };
    const updateRes = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (updateRes.ok) {
      setSnackbar({ open: true, message: 'Product updated!', severity: 'success' });
      loadProducts();
    } else {
      const err = await updateRes.json();
      setSnackbar({ open: true, message: 'Error: ' + (err.error || 'Failed to update product'), severity: 'error' });
    }
  };

  const filteredProducts = products.filter(p => {
    const q = search.trim().toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Typography variant="h4" gutterBottom>Inventory Module</Typography>
        <Typography variant="h6" gutterBottom>Add New Product</Typography>
        <Box component="form" id="productForm" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
          <TextField label="Product Name" id="name" value={form.name} onChange={handleChange} required />
          <TextField label="SKU (unique)" id="sku" value={form.sku} onChange={handleChange} required />
          <TextField label="Quantity" id="quantity" value={form.quantity} onChange={handleChange} type="number" required />
          <TextField label="Price" id="price" value={form.price} onChange={handleChange} type="number" required />
          <TextField label="Category" id="category" value={form.category} onChange={handleChange} />
          <Button type="submit" variant="contained">Add Product</Button>
        </Box>
      </Paper>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h6" gutterBottom>All Products</Typography>
        <TextField label="Search products..." id="productSearch" value={search} onChange={e => setSearch(e.target.value)} sx={{ mb: 2 }} />
        {loading ? <Typography>Loading...</Typography> : (
          <TableContainer>
            <Table id="productTable">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.category || ''}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color="primary" onClick={() => handleEdit(product._id)} sx={{ mr: 1 }}>Edit</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(product._id)}>Delete</Button>
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