import React, { useEffect, useState } from 'react';

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

  return (
    <div className="container">
      <h1>Welcome to ERP System</h1>
      <div id="dashboard-stats" style={{ opacity: stats || error ? 1 : 0, transition: 'opacity 0.7s', marginBottom: 30, width: '100%', maxWidth: 700, display: 'flex', justifyContent: 'space-around', gap: 20 }}>
        {stats ? (
          <>
            <div style={{background:'#fff',padding:'18px 24px',borderRadius:10,boxShadow:'0 2px 8px #0001',minWidth:120,textAlign:'center'}}>
              <div style={{fontSize:'1.1rem',color:'#888'}}>Sales</div>
              <div style={{fontSize:'1.5rem',fontWeight:'bold'}}>&#8377;{stats.totalSales}</div>
            </div>
            <div style={{background:'#fff',padding:'18px 24px',borderRadius:10,boxShadow:'0 2px 8px #0001',minWidth:120,textAlign:'center'}}>
              <div style={{fontSize:'1.1rem',color:'#888'}}>Customers</div>
              <div style={{fontSize:'1.5rem',fontWeight:'bold'}}>{stats.totalCustomers}</div>
            </div>
            <div style={{background:'#fff',padding:'18px 24px',borderRadius:10,boxShadow:'0 2px 8px #0001',minWidth:120,textAlign:'center'}}>
              <div style={{fontSize:'1.1rem',color:'#888'}}>Products</div>
              <div style={{fontSize:'1.5rem',fontWeight:'bold'}}>{stats.totalProducts}</div>
            </div>
            <div style={{background:'#fff',padding:'18px 24px',borderRadius:10,boxShadow:'0 2px 8px #0001',minWidth:120,textAlign:'center'}}>
              <div style={{fontSize:'1.1rem',color:'#888'}}>Inventory</div>
              <div style={{fontSize:'1.5rem',fontWeight:'bold'}}>&#8377;{stats.totalInventoryValue}</div>
            </div>
          </>
        ) : error ? <span style={{color:'#c00'}}>{error}</span> : null}
      </div>
      <div className="buttons">
        <a href="/sales" style={{margin:4}}><button>Sales Module</button></a>
        <a href="/inventory" style={{margin:4}}><button>Inventory Module</button></a>
        <a href="/crm" style={{margin:4}}><button>CRM Module</button></a>
        <a href="/customer-dashboard" style={{margin:4}}><button>Customer Dashboard</button></a>
        <a href="/reports" style={{margin:4}}><button>Reports</button></a>
        <a href="/expenses" style={{margin:4}}><button>Expenses</button></a>
      </div>
    </div>
  );
} 