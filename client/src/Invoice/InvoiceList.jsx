import React from 'react';
import { formatCurrency } from './utils';
import '../Home.css'; // Import your modern styles here

export default function InvoiceList({
  invoices, 
  selectInvoice, 
  handleEditClick, 
  handleDeleteClick, 
  showCreate, 
  setShowCreate, 
  setEditingInvoice, 
  resetForm,
  error,
  setSelectedInvoice,
  handlePrint
}) {
  return (
    <div className="erp-container">
      <header className="erp-header">
        <h1 className="erp-heading">
          <strong>Invoices</strong>
        </h1>
      </header>

      <div style={{ marginBottom: 20 }}>
        <button
          className="erp-action-btn no-print"
          onClick={() => {
            setShowCreate(!showCreate);
            setEditingInvoice(null);
            resetForm();
          }}
        >
          {showCreate ? 'Cancel' : 'Create Invoice'}
        </button>
      </div>

      <div className="erp-card-list">
        {invoices.map(inv => (
          <div
            key={inv._id}
            className={`erp-card invoice-card ${inv.status==='paid' ? 'paid' : ''}`}
            style={{ borderLeft: inv.status==='paid' ? '6px solid #39b54a' : '6px solid #1976d2', marginBottom: 20, boxShadow: '0 2px 14px #0002' }}
          >
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
              <div>
                <h3 style={{margin:'0 0 6px 0', color:'#2e3b4e'}}>{inv.customer?.name}</h3>
                <div style={{color:'#888', fontSize:15}}>Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:19, fontWeight:'bold', color: inv.status==='paid' ? "#39b54a" : "#1976d2"}}>
                  {formatCurrency(inv.total)}
                </div>
                <div style={{fontSize:13, marginTop:4}}>
                  Status:{' '}
                  <span style={{
                    background: inv.status==='paid' ? '#e7fbe9' : '#e7f2fa',
                    color: inv.status==='paid' ? '#229954':'#178',
                    borderRadius:6,
                    padding:'2px 10px',
                  }}>
                    {inv.status}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
              <button className="erp-action-btn no-print" onClick={() => selectInvoice(inv)}>
                View
              </button>
              <button
                className="no-print"
                style={{ background: "#f6e05e", color: "#121", fontWeight: 500, border:'none', borderRadius:6, padding:'6px 18px', cursor:'pointer' }}
                onClick={() => handleEditClick(inv)}
              >
                Edit
              </button>
              <button
                className="no-print"
                style={{ background: "#ea4e3d", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", cursor: "pointer" }}
                onClick={() => handleDeleteClick(inv)}
              >
                Delete
              </button>
              <button className="erp-print-btn no-print" onClick={() => { setSelectedInvoice(inv); setTimeout(handlePrint, 400); }}>
                Print
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="erp-error no-print" style={{ marginTop: 20 }}>{error}</div>}
      <div style={{margin:"34px 0 0 0", color:"#778", fontSize:13, textAlign:"center"}}>Enjoy Enjoy</div>
    </div>
  );
}
