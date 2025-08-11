// CustomerDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  TableContainer,
  InputLabel,
  FormControl,
  Button,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

/* ------------------------------------------------------------------ */
/* UTILS */
/* ------------------------------------------------------------------ */

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';
const formatDate = (d) => new Date(d).toLocaleDateString();
const toCsv = (rows) =>
  [
    ['Date', 'Products', 'Qty', 'Price', 'Total', 'Status'],
    ...rows.map((s) => [
      formatDate(s.createdAt),
      s.items.map((i) => i.productName).join(' | '),
      s.items.map((i) => i.quantity).join(' | '),
      s.items.map((i) => i.price).join(' | '),
      s.totalAmount,
      s.status
    ])
  ]
    .map((r) => r.join(','))
    .join('\n');

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */
export default function CustomerDashboard() {
  /* -------------------- state -------------------- */
  const [allCustomers, setAllCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [sales, setSales] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  /* -------------------- effects -------------------- */
  useEffect(() => {
    loadCustomers();
  }, []);

  /* -------------------- handlers -------------------- */
  const loadCustomers = async () => {
    const res = await fetch(`${API_BASE_URL}/api/customers`);
    const data = await res.json();
    setAllCustomers(data);
    setFilteredCustomers(data);
  };

  const handleSearch = (e) => {
    const q = e.target.value.trim().toLowerCase();
    setFilteredCustomers(
      allCustomers.filter((c) => c.name.toLowerCase().includes(q))
    );
    setSelectedCustomer('');
    setSales([]);
    setExpandedRow(null);
  };

  const handleSelect = (e) => {
    setSelectedCustomer(e.target.value);
  };

  const handleLoadSales = async () => {
    if (!selectedCustomer) return;
    const res = await fetch(`${API_BASE_URL}/api/sales`);
    const allSales = await res.json();
    let filtered = allSales.filter((s) => s.customerName === selectedCustomer);

    /* optional: date range filter */
    if (dateFilter.from) {
      filtered = filtered.filter(
        (s) => new Date(s.createdAt) >= new Date(dateFilter.from)
      );
    }
    if (dateFilter.to) {
      filtered = filtered.filter(
        (s) => new Date(s.createdAt) <= new Date(dateFilter.to)
      );
    }
    setSales(filtered);
    setExpandedRow(null);
  };

  const handleExport = () => {
    if (!sales.length) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([toCsv(sales)], { type: 'text/csv' })
    );
    link.download = `${selectedCustomer}_sales.csv`;
    link.click();
    setSnackbar({
      open: true,
      message: 'CSV exported!',
      severity: 'success'
    });
  };

  /* -------------------- derived -------------------- */
  const summary = useMemo(() => {
    if (!sales.length) return '';
    const totalSpent = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    return `Total Spent by ${selectedCustomer}: ₹${totalSpent.toLocaleString()}`;
  }, [sales, selectedCustomer]);

  /* -------------------- render -------------------- */
  return (
    <Box
      sx={{
        mt: 4,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Customer Dashboard
      </Typography>

      {/* -------------------- Filters Card -------------------- */}
      <Paper sx={{ p: 3, mb: 4, width: '100%' }} elevation={3}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search customers..."
            onChange={handleSearch}
            size="small"
          />

          <FormControl sx={{ minWidth: 220 }} size="small">
            <InputLabel id="customerSelect-label">Select Customer</InputLabel>
            <Select
              labelId="customerSelect-label"
              id="customerSelect"
              value={selectedCustomer}
              label="Select Customer"
              onChange={handleSelect}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {filteredCustomers.map((c) => (
                <MenuItem key={c._id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* date range */}
          <Tooltip title="From">
            <TextField
              type="date"
              size="small"
              value={dateFilter.from}
              onChange={(e) =>
                setDateFilter((p) => ({ ...p, from: e.target.value }))
              }
            />
          </Tooltip>
          <Tooltip title="To">
            <TextField
              type="date"
              size="small"
              value={dateFilter.to}
              onChange={(e) =>
                setDateFilter((p) => ({ ...p, to: e.target.value }))
              }
            />
          </Tooltip>

          <Button
            variant="contained"
            endIcon={<FilterListIcon />}
            onClick={handleLoadSales}
            disabled={!selectedCustomer}
          >
            Load Sales
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={!sales.length}
          >
            Export CSV
          </Button>
        </Box>
      </Paper>

      {/* -------------------- Sales Table -------------------- */}
      {sales.length > 0 && (
        <Paper sx={{ p: 3, mb: 2, width: '100%' }} elevation={3}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Sales for {selectedCustomer}
          </Typography>
          <TableContainer>
            <Table id="salesTable" size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Date</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale, idx) => {
                  const itemNames = sale.items
                    .map((i) => i.productName)
                    .join(', ');
                  const qtys = sale.items.map((i) => i.quantity).join(', ');
                  const prices = sale.items.map((i) => i.price).join(', ');
                  const isExpanded = expandedRow === idx;

                  return (
                    <React.Fragment key={idx}>
                      <TableRow hover>
                        <TableCell padding="checkbox">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : idx)
                            }
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{formatDate(sale.createdAt)}</TableCell>
                        <TableCell>{itemNames}</TableCell>
                        <TableCell>{qtys}</TableCell>
                        <TableCell>{prices}</TableCell>
                        <TableCell>{sale.totalAmount}</TableCell>
                        <TableCell>{sale.status}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={7}
                        >
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Additional Details
                              </Typography>
                              <pre
                                style={{
                                  margin: 0,
                                  fontFamily: 'monospace',
                                  fontSize: 12
                                }}
                              >
                                {JSON.stringify(sale, null, 2)}
                              </pre>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography id="summary" sx={{ mt: 2, fontWeight: 500 }}>
            {summary}
          </Typography>
        </Paper>
      )}

      {/* -------------------- Snackbar -------------------- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3_000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}
