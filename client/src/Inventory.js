import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  TableContainer,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    quantity: "",
    price: "",
    // tax:"",
    category: "",
  });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/products`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id || e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const product = {
      name: form.name,
      sku: form.sku,
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      category: form.category,
    };
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      setSnackbar({
        open: true,
        message: "Product added!",
        severity: "success",
      });
      setForm({ name: "", sku: "", quantity: "", price: "", category: "" });
      loadProducts();
      setShowForm(false);
    } else {
      const err = await res.json();
      setSnackbar({
        open: true,
        message: "Error: " + (err.error || "Failed to add product"),
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSnackbar({ open: true, message: "Deleted!", severity: "success" });
      loadProducts();
    } else {
      setSnackbar({
        open: true,
        message: "Failed to delete.",
        severity: "error",
      });
    }
  };

  const handleEdit = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
    const product = await res.json();
    const newName = prompt("Edit name:", product.name);
    const newQty = prompt("Edit quantity:", product.quantity);
    const newPrice = prompt("Edit price:", product.price);
    // const newTax = prompt("Edit tax:",product.tax )
    const newCat = prompt("Edit category:", product.category);
    const updated = {
      name: newName,
      quantity: parseInt(newQty),
      price: parseFloat(newPrice),
      // tax:parseFloat(newTax),
      category: newCat,
      sku: product.sku,
    };
    const updateRes = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (updateRes.ok) {
      setSnackbar({
        open: true,
        message: "Product updated!",
        severity: "success",
      });
      loadProducts();
    } else {
      const err = await updateRes.json();
      setSnackbar({
        open: true,
        message: "Error: " + (err.error || "Failed to update product"),
        severity: "error",
      });
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  });

  const filteredProducts = sortedProducts.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q));
    const matchCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchSearch && matchCategory;
  });

  return (
    <Box sx={{ mt: 1 }}>
      <h1 align="center">Inventory Management</h1>

      <div className="container">
        <Paper
          sx={{
            p: 3,
            mb: 4,
            bgcolor: "background.paper",
            color: "text.primary",
          }}
          elevation={3}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
            <Button variant="contained" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Hide Form" : "Add New Product"}
            </Button>
          </Box>
          {showForm && (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxWidth: 1100,
              }}
            >
              <TextField
                label="Product Name"
                id="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <TextField
                label="SKU (unique)"
                id="sku"
                value={form.sku}
                onChange={handleChange}
                required
              />
              <TextField
                label="Quantity"
                id="quantity"
                value={form.quantity}
                onChange={handleChange}
                type="number"
                required
              />
              <TextField
                label="Price"
                id="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                required
              />
                            {/* <TextField
                label="tax"
                id="tax"
                value={form.tax}
                onChange={handleChange}
                type="number"
                required
              /> */}
              <TextField
                label="Category"
                id="category"
                value={form.category}
                onChange={handleChange}
              />
              <Button type="submit" variant="contained">
                Submit
              </Button>
            </Box>
          )}
        </Paper>

        <Paper
          sx={{ p: 3, bgcolor: "background.paper", color: "text.primary" }}
          elevation={3}
        >
          <Typography variant="h6" gutterBottom>
            All Products
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <TextField
              label="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="category-filter-label">
                Filter by Category
              </InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Filter by Category"
              >
                <MenuItem value="">All</MenuItem>
                {[
                  ...new Set(products.map((p) => p.category).filter(Boolean)),
                ].map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      onClick={() => handleSort("name")}
                      style={{ cursor: "pointer" }}
                    >
                      Name{" "}
                      {sortField === "name"
                        ? sortOrder === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell
                      onClick={() => handleSort("quantity")}
                      style={{ cursor: "pointer" }}
                    >
                      Qty{" "}
                      {sortField === "quantity"
                        ? sortOrder === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </TableCell>
                    <TableCell
                      onClick={() => handleSort("price")}
                      style={{ cursor: "pointer" }}
                    >
                      Price{" "}
                      {sortField === "price"
                        ? sortOrder === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </TableCell>
                    {/* <TableCell>Tax</TableCell> */}
                    <TableCell>Category</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.price}</TableCell>
                      {/* <TableCell>{product.tax}</TableCell> */}
                      <TableCell>{product.category || ""}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleEdit(product._id)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
