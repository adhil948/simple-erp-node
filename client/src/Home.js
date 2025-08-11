import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  useTheme,
  Chip,
  Skeleton,
  Tooltip,
  Stack,
  LinearProgress,
  Button,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CircularProgress from "@mui/material/CircularProgress";

import SalesChart from "./SalesChart";
import TextType from "./TextType";

// Utility: Humanize big numbers
function formatNumber(n) {
  if (!n && n !== 0) return "-";
  if (n < 1_000) return n;
  if (n < 1_000_000) return `${Math.round(n / 1_000)}k`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000_000_000).toFixed(1)}B`;
}

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function Home() {
  const theme = useTheme();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [salesTrend, setSalesTrend] = useState([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Fetch dashboard stats ---
  useEffect(() => {
    let active = true;
    async function loadDashboardStats() {
      setStatsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/reports/summary`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (active) setStats(data);
        console.log("Dashboard stats:", data);
      } catch (err) {
        if (active) setError("Failed to load stats.");
      } finally {
        if (active) setStatsLoading(false);
      }
    }
    loadDashboardStats();
    return () => {
      active = false;
    };
  }, []);

  // --- Fetch sales trend chart ---
  useEffect(() => {
    let active = true;
    (async function fetchSalesTrend() {
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 14); // last 15 days
        const qs = `?start=${start.toISOString().slice(0, 10)}&end=${end
          .toISOString()
          .slice(0, 10)}`;
        const res = await fetch(`${API_BASE_URL}/api/reports/sales-daily` + qs);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (active) setSalesTrend(data);
      } catch (e) {
        // Optionally set sales loading error
      } finally {
        if (active) setSalesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // --- Navigation handler ---
  const handleCardClick = (path) => {
    window.location.href = path;
  };

  // --- Animated Hero Section ---
  const welcomeMsgs = [
    "Welcome to your Business ERP Dashboard",
    "Empowering Smart Business Decisions",
    "All-in-One Platform to Grow Efficiently",
  ];

  // --- Quick Actions ---
  const quickActions = [
    {
      label: "Add Sale",
      icon: <ShoppingCartIcon fontSize="small" />,
      onClick: () => handleCardClick("/sales"),
    },
    {
      label: "Create Invoice",
      icon: <ReceiptIcon fontSize="small" />,
      onClick: () => handleCardClick("/invoices"),
    },
    {
      label: "Add Product",
      icon: <InventoryRoundedIcon fontSize="small" />,
      onClick: () => handleCardClick("/inventory"),
    },
  ];

  // --- Statistic Card Data ---
  const statCards = stats
    ? [
        {
          label: "Sales",
          value: `₹${formatNumber(stats.totalSales)}`,
          // growth: stats.salesGrowth ?? 3.2,
          icon: <TrendingUpIcon sx={{ color: "#388e3c" }} />, // deep green
          color: "#e8f5e9", // light green background
          onClick: () => handleCardClick("/sales"),
        },
        {
          label: "Customers",
          value: formatNumber(stats.totalCustomers),
          icon: <PeopleAltRoundedIcon sx={{ color: "#1976d2" }} />, // medium blue
          color: "#e3f2fd", // soft blue background
          onClick: () => handleCardClick("/crm"),
        },
        {
          label: "Products",
          value: formatNumber(stats.totalProducts),
          icon: <InventoryRoundedIcon sx={{ color: "#6a1b9a" }} />, // purple
          color: "#f3e5f5", // lavender background
          onClick: () => handleCardClick("/inventory"),
        },
        {
          label: "Inventory Value",
          value: `₹${formatNumber(stats.totalInventoryValue)}`,
          icon: <AttachMoneyIcon sx={{ color: "#ff8f00" }} />, // amber
          color: "#fff8e1", // light amber background
          onClick: () => handleCardClick("/inventory"),
        },
        {
          label: "Invoices",
          value: formatNumber(stats.totalInvoices),
          icon: <AssessmentIcon sx={{ color: "#0288d1" }} />, // deep sky blue
          color: "#e0f7fa", // pale cyan background
          onClick: () => handleCardClick("/invoices"),
        },
      ]
    : [];

  // --- Loading placeholders for cards (MUI Skeleton) ---
  const cardSkeletons = Array(5).fill(null);

  return (
    <Box>
      {/* Hero Header with Text Animation */}
      <Box
        sx={{
          pb: 3,
          textAlign: "center",
          mt: { xs: 2, md: 0 },
        }}
      >
        <Typography
          variant="h3"
          fontWeight={700}
          letterSpacing={0.8}
          sx={{ mb: 1 }}
        >
          <TextType
            text={["ERP Dashboard"]}
            typingSpeed={90}
            pauseDuration={1200}
            showCursor={false}
            cursorCharacter="."
          />
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 1,
            minHeight: "30px",
            fontWeight: 500,
            letterSpacing: 0.15,
          }}
        >
          <TextType
            text={welcomeMsgs}
            typingSpeed={48}
            pauseDuration={1600}
            showCursor={true}
            cursorCharacter="_"
          />
        </Typography>
        <Box>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 1 }}
          >
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outlined"
                size="small"
                color="primary"
                startIcon={action.icon}
                sx={{
                  borderRadius: 7,
                  textTransform: "none",
                }}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        {statsLoading
          ? cardSkeletons.map((_, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Skeleton variant="rounded" height={110} />
              </Grid>
            ))
          : statCards.map((card, idx) => (
              <Grid item xs={12} sm={6} md={3} lg={2.4} key={card.label}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    p: 0,
                    height: "100%",
                    boxShadow: "0 3px 14px rgba(43,74,160,0.06)",
                    background: card.color,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: "0 6px 40px rgba(43,88,160,0.14)",
                      transform: "translateY(-4px) scale(1.03)",
                      cursor: "pointer",
                      "& .stat-card-label": {
                        color: "#fff", // change label text color on hover
                      },
                    },
                  }}
                  onClick={card.onClick}
                >
                  <CardActionArea>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: "#fff",
                            color: theme.palette.primary.main,
                            boxShadow: 1,
                            border: "2px solid #f5f5f5",
                          }}
                        >
                          {card.icon}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, letterSpacing: 0.07 }}
                          >
                            {card.value}
                          </Typography>
                          <Typography
                            variant="body2"
                            className="stat-card-label"
                            sx={{
                              fontWeight: 400,
                              letterSpacing: 0.1,
                              color: "black",
                            }}
                          >
                            {card.label}
                          </Typography>

                          {card.growth !== undefined && (
                            <Chip
                              label={`+${card.growth}%`}
                              color="success"
                              size="small"
                              sx={{ ml: 0.5, mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Error + Chart Section */}
      <Box sx={{ mt: 6, mb: 3 }}>
        {error && (
          <Box color="error.main" sx={{ my: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        <Card
          elevation={5}
          sx={{
            borderRadius: 4,
            px: { xs: 1, md: 4 },
            pt: 3,
            pb: 4,
            mt: 2,
            width: "100%",
            boxShadow: "0 8px 26px rgba(25,120,210,0.10)",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(94deg, #10111a 80%, #253050 105%)"
                : "linear-gradient(95deg, #fff 75%, #eaf3ff 106%)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Sales Trend (Last 15 Days)
          </Typography>
          {salesLoading ? (
            <Box
              sx={{
                width: 1,
                height: 350,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading sales trend...</Typography>
            </Box>
          ) : (
            <Box sx={{ maxWidth: "100%", minHeight: 300 }}>
              {salesTrend && salesTrend.length > 0 ? (
                <SalesChart
                  labels={salesTrend.map((d) => d.date)}
                  datasets={[
                    {
                      label: "Daily Sales (₹)",
                      data: salesTrend.map((d) => d.total),
                      borderColor: "#1976d2",
                      backgroundColor: "rgba(25,118,210,0.12)",
                      fill: true,
                      tension: 0.16,
                      pointRadius: 3.7,
                      pointHoverRadius: 5,
                    },
                  ]}
                  options={{
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `₹${ctx.parsed.y} on ${ctx.label}`,
                        },
                      },
                    },
                    scales: {
                      x: { grid: { display: false } },
                      y: { title: { display: false }, beginAtZero: true },
                    },
                  }}
                  height={340}
                  width={1100}
                />
              ) : (
                <Typography
                  color="textSecondary"
                  fontSize={18}
                  sx={{ py: 10, textAlign: "center" }}
                >
                  No sales data available for this period.
                </Typography>
              )}
            </Box>
          )}
        </Card>
      </Box>

      {/* Cool: Motivational Quote Block */}
      <Box
        sx={{
          mt: 7,
          textAlign: "center",
          color: "text.secondary",
          fontStyle: "italic",
        }}
      >
        <Typography variant="body1">
          {" "}
          <span role="img" aria-label="rocket">
            🚀
          </span>
        </Typography>
      </Box>
    </Box>
  );
}
