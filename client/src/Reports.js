import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Paper, Typography, Card, CardContent, Grid, Snackbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, InputLabel,
  FormControl, Select, MenuItem, Button
} from '@mui/material';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const chartRef = useRef();
  const chartInstance = useRef();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data || []);
      } catch (e) {}
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch('/api/reports/summary');
        const data = await res.json();
        setSummary(data);
        setTopProducts(data.topProducts || []);
      } catch (e) {
        setSnackbar({ open: true, message: 'Failed to load report', severity: 'error' });
      }
    }
    loadReport();
  }, []);

  useEffect(() => {
    async function loadChartLibs() {
      if (!window.Chart) {
        await new Promise(resolve => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      if (!window.Chart?.registry?.getPlugin('zoom')) {
        const zoomScript = document.createElement('script');
        zoomScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom';
        document.body.appendChild(zoomScript);
      }
    }
    loadChartLibs();
  }, []);

  const buildSalesQuery = () => {
    const params = [];
    if (startDate) params.push(`start=${startDate}`);
    if (endDate) params.push(`end=${endDate}`);
    if (selectedProduct) params.push(`productId=${selectedProduct}`);
    return params.length > 0 ? "?" + params.join("&") : "";
  };

  const loadSalesChart = async () => {
    if (!chartRef.current || !window.Chart) return;
    try {
      const query = buildSalesQuery();
      const res = await fetch('/api/reports/sales-daily' + query);
      const data = await res.json();
      const labels = data.map(d => d.date);
      const totals = data.map(d => d.total);

      let datasets = [];
      if (selectedProduct || products.length === 0 || data[0]?.productName === undefined) {
        datasets = [{
          label: 'Total Sales (₹)',
          data: totals,
          borderColor: '#1976d2',
          fill: false,
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6,
        }];
      } else {
        const grouped = {};
        data.forEach(({ date, total, productName }) => {
          if (!grouped[productName]) grouped[productName] = { label: productName, data: {}, borderColor: randomColor(productName) };
          grouped[productName].data[date] = total;
        });
        datasets = Object.values(grouped).map(g => ({
          label: g.label,
          data: labels.map(l => g.data[l] ?? 0),
          borderColor: g.borderColor,
          fill: false,
          tension: 0.1
        }));
      }

      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new window.Chart(chartRef.current, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: ctx => `₹${ctx.parsed.y} on ${ctx.label}` + (ctx.dataset.label ? ` (${ctx.dataset.label})` : '')
              }
            },
            zoom: {
              pan: { enabled: true, mode: 'x' },
              zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
            }
          },
          scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Sales (₹)' }, beginAtZero: true }
          }
        }
      });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to load sales chart', severity: 'error' });
    }
  };

  function randomColor(key) {
    const num = Array.from(key || 'xyz').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
    return `hsl(${num},60%,55%)`;
  }

  useEffect(() => {
    loadSalesChart();
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    // eslint-disable-next-line
  }, [startDate, endDate, selectedProduct, products.length]);

  useEffect(() => {
    if (!startDate && !endDate) {
      const today = new Date(), prior = new Date();
      prior.setDate(today.getDate() - 29);
      setEndDate(today.toISOString().slice(0, 10));
      setStartDate(prior.toISOString().slice(0, 10));
    }
  }, []);

  const handleFilterChange = e => {
    e?.preventDefault();
    loadSalesChart();
  };

  const handleResetZoom = () => {
    if (chartInstance.current && chartInstance.current.resetZoom) chartInstance.current.resetZoom();
  };

  const handleShowAllDates = () => {
    setStartDate('2000-01-01');
    setEndDate('2100-01-01');
  };

  const handleCardClick = (path) => { window.location.href = path; };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">📊 Reports Dashboard</Typography>

      <Grid container spacing={5} sx={{ mb: 4 }} justifyContent="center">
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} onClick={() => handleCardClick('/sales')}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Sales</Typography>
              <Typography variant="h6">₹{summary ? summary.totalSales : '...'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} onClick={() => handleCardClick('/crm')}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Customers</Typography>
              <Typography variant="h6">{summary ? summary.totalCustomers : '...'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} onClick={() => handleCardClick('/inventory')}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Products</Typography>
              <Typography variant="h6">{summary ? summary.totalProducts : '...'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Inventory Value</Typography>
              <Typography variant="h6">₹{summary ? summary.totalInventoryValue : '...'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Typography variant="h6" gutterBottom>🔥 Top Selling Products</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Quantity Sold</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topProducts.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.productName}</TableCell>
                  <TableCell align="right">{p.totalQty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Typography variant="h6" gutterBottom>📅 Daily Sales Trend</Typography>
        <Box
          component="form"
          onSubmit={handleFilterChange}
          sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}
        >
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            size="small"
            onChange={e => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            size="small"
            onChange={e => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {products.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="product-filter-label">Product</InputLabel>
              <Select
                labelId="product-filter-label"
                label="Product"
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                renderValue={(selected) => {
                  if (!selected) return 'All Products';
                  const product = products.find(p => p._id === selected);
                  return product ? product.name : selected;
                }}
                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
              >
                <MenuItem value="">
                  <em>All Products</em>
                </MenuItem>
                <CustomSearchableItems
                  items={products}
                  selected={selectedProduct}
                  setSelected={setSelectedProduct}
                />
              </Select>
            </FormControl>
          )}
          <Button type="submit" variant="contained" size="small">Apply</Button>
          <Button variant="outlined" size="small" onClick={handleResetZoom} sx={{ ml: 1 }}>
            Reset Zoom
          </Button>
          <Button variant="outlined" size="small" onClick={handleShowAllDates} sx={{ ml: 1 }}>
            Show All Dates
          </Button>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <canvas id="salesChart" ref={chartRef} height="120"></canvas>
        </Box>
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

// 🔍 Custom component for searchable dropdown
function CustomSearchableItems({ items, selected, setSelected }) {
  const [filterText, setFilterText] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <>
      <Box sx={{ px: 2, pt: 1 }}>
        <TextField
          autoFocus
          size="small"
          fullWidth
          placeholder="Search Product..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
        />
      </Box>
      {filteredItems.map(item => (
        <MenuItem
          key={item._id}
          value={item._id}
          selected={item._id === selected}
          onClick={() => setSelected(item._id)}
        >
          {item.name}
        </MenuItem>
      ))}
      {filteredItems.length === 0 && (
        <MenuItem disabled>No matches found</MenuItem>
      )}
    </>
  );
}
