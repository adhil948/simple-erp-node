import React, { useEffect, useState } from 'react';
import './Home.css';


export default function Home() {
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
