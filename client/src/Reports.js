import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Paper, Typography, Card, CardContent, Grid, Snackbar, TableContainer
} from '@mui/material';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const chartRef = useRef();
  const chartInstance = useRef();

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch('/api/reports/summary');
        const data = await res.json();
        setSummary(data);
        setTopProducts(data.topProducts || []);
      } catch (e) {
        setError('Failed to load report');
        setSnackbar({ open: true, message: 'Failed to load report', severity: 'error' });
      }
    }
    loadReport();
  }, []);

  useEffect(() => {
    async function loadSalesChart() {
      if (!chartRef.current) return;
      try {
        const res = await fetch('/api/reports/sales-daily');
        const data = await res.json();
        const labels = data.map(d => d.date);
        const totals = data.map(d => d.total);
        if (window.Chart) {
          if (chartInstance.current) chartInstance.current.destroy();
          chartInstance.current = new window.Chart(chartRef.current, {
            type: 'line',
            data: {
              labels: labels,
              datasets: [{
                label: 'Total Sales (₹)',
                data: totals,
                borderColor: '#1976d2',
                fill: false,
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
              }]
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Sales (₹)' }, beginAtZero: true }
              }
            }
          });
        }
      } catch (e) {
        // ignore chart error
      }
    }
    loadSalesChart();
    // Cleanup chart on unmount
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [summary]);

  useEffect(() => {
    // Dynamically load Chart.js if not present
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {};
      document.body.appendChild(script);
    }
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Reports Dashboard</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">Total Sales</Typography>
              <Typography variant="h6">₹{summary ? summary.totalSales : '...'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">Total Customers</Typography>
              <Typography variant="h6">{summary ? summary.totalCustomers : '...'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">Total Products</Typography>
              <Typography variant="h6">{summary ? summary.totalProducts : '...'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary">Inventory Value</Typography>
              <Typography variant="h6">₹{summary ? summary.totalInventoryValue : '...'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Paper sx={{ p: 3, mb: 2 }} elevation={3}>
        <Typography variant="h6" gutterBottom>Top Selling Products</Typography>
        <ul id="topProducts">
          {topProducts.map((p, i) => (
            <li key={i}>{p.productName} - {p.totalQty} sold</li>
          ))}
        </ul>
      </Paper>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h6" gutterBottom>📅 Daily Sales</Typography>
        <TableContainer>
          <canvas id="salesChart" ref={chartRef} height="100"></canvas>
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