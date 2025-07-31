import React, { useEffect, useState } from 'react';
import './Home.css';
import SalesChart from './SalesChart.js';


export default function Home() {
const [salesTrend,setSalesTrend] = useState([]);
const [stats, setStats] = useState(null);
const [error, setError] = useState('');


useEffect(() => {
async function loadDashboardStats() {
try {
const res = await fetch('/api/reports/summary');
const data = await res.json();
setStats(data);
} catch (e) {
setError('Failed to load stats');
}
}
loadDashboardStats();
}, []);

  useEffect(() => {
    async function fetchSalesTrend() {
      try {
        // Example: Show last 15 days
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 14);
        const qs = `?start=${start.toISOString().slice(0,10)}&end=${end.toISOString().slice(0,10)}`;
        const res = await fetch('/api/reports/sales-daily' + qs);
        const data = await res.json();
        setSalesTrend(data);
      } catch (e) {
        // Optionally show error
      }
    }
    fetchSalesTrend();
  }, []);


const handleCardClick = (path) => {
window.location.href = path;
};


return (
<div>
<div className="container">
<header className="erp-header">
<h1>📊 ERP Dashboard</h1>
<p>Manage your business efficiently</p>
</header>


<section className="erp-stats">
{stats ? (
<>
<div
className="erp-card"
onClick={() => handleCardClick('/sales')}
>
<h3>Sales</h3>
<p>&#8377;{stats.totalSales}</p>
</div>
<div
className="erp-card"
onClick={() => handleCardClick('/crm')}
>
<h3>Customers</h3>
<p>{stats.totalCustomers}</p>
</div>
<div
className="erp-card"
onClick={() => handleCardClick('/inventory')}
>
<h3>Products</h3>
<p>{stats.totalProducts}</p>
</div>
<div
className="erp-card"
onClick={() => handleCardClick('/inventory')}
>
<h3>Inventory Value</h3>
<p>&#8377;{stats.totalInventoryValue}</p>
</div>
<div>
<section className="erp-sales-chart" style={{ maxWidth: 1200, margin: '32px auto' }}>
    <h2 style={{marginTop:32}}>📈 Sales Trend (Last 15 Days)</h2>
    {salesTrend.length > 0 ? (
        <SalesChart
            labels={salesTrend.map(d => d.date)}
            datasets={[
                {
                    label: 'Daily Sales (₹)',
                    data: salesTrend.map(d => d.total),
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25,118,210,0.1)',
                    fill: true,
                    tension: 0.1,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                }
            ]}
            options={{
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `₹${ctx.parsed.y} on ${ctx.label}`
                        }
                    }
                },
                scales: {
                    x: { title: { display: false }, grid: {display:false} },
                    y: { title: { display: false }, beginAtZero: true }
                }
            }}
            height={350}
            width={1100}
        />
    ) : (
        <div className="erp-loading">Loading chart...</div>
    )}
</section>
</div>
</>


) : error ? (
<div className="erp-error">{error}</div>
) : (
<div className="erp-loading">Loading stats...</div>
)}
</section>
</div>
</div>
);
}
