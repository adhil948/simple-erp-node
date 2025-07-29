import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Simple styles for beautification and print
const styles = {
  container: {
    maxWidth: 950, margin: '40px auto', background: '#f7f9fa', borderRadius: 12, boxShadow: '0 8px 32px #0002', padding: 32
  },
  table: {
    width: '100%', marginBottom: 22, borderSpacing: 0, background: '#fff', borderRadius: 8, overflow: 'hidden'
  },
  th: {
    background: '#e6f0fa', padding: 8, fontWeight: 600, fontSize: 16, borderBottom: '2px solid #dde'
  },
  td: {
    padding: 8, fontSize: 15, borderBottom: '1px solid #eee'
  },
  actionBtn: {
    marginRight: 10, padding: "6px 18px", borderRadius: 6, border: 'none', cursor: 'pointer', background: "#2d72d9", color: "white"
  },
  dangerBtn: {
    background: "#ea4e3d",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 18px",
    cursor: "pointer",
    marginLeft: 10,
  },
  printBtn: {
    background: "#39b54a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 18px",
    cursor: "pointer",
    marginLeft: 10,
  },
  highlight: {
    color: "#2563eb",
    fontWeight: "bold"
  },
  invoiceCard: {
    background: "#fff",
    borderRadius: 10,
    padding: 32,
    boxShadow: '0 6px 32px #0002'
  }
};

// Print CSS (hides controls/buttons and only shows the invoice card)
const printCSS = `
@media print {
  body * { visibility: hidden !important; }
  #printable-invoice, #printable-invoice * { visibility: visible !important; }
  #printable-invoice { 
    position: absolute !important; 
    left: 0; top: 0; width: 100vw; background: #fff; box-shadow: none; 
    padding: 0 !important;
    margin: 0 !important; 
    max-width:none !important;
  } 
  .no-print { display: none !important;}
}
`;

function formatCurrency(amount) {
  return '₹' + (amount ? Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00');
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [newInvoice, setNewInvoice] = useState({ customer: '', items: [{ product: '', quantity: 1, price: 0 }], dueDate: '' });
  const [createError, setCreateError] = useState('');

  const location = useLocation();
  const printRef = useRef();

  // Inject print style on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printCSS;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetch('/api/customers').then(r => r.json()).then(setCustomers).catch(() => setCustomers([]));
    fetch('/api/products').then(r => r.json()).then(setProducts).catch(() => setProducts([]));
  }, []);

  // Prefill create invoice from Sales
  useEffect(() => {
    if (location.state && location.state.sale) {
      const { customerId, items, saleId } = location.state.sale;
      setShowCreate(true);
      setNewInvoice({
        customer: customerId,
        items: items.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        saleId:saleId,
        dueDate: ''
      });
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line
  }, [location.state]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data);
    } catch {
      setError('Failed to load invoices');
    }
    setLoading(false);
  };

  const handleEditClick = (invoice) => {
    setEditingInvoice(invoice);
    setNewInvoice({
      customer: invoice.customer?._id || '',
      items: invoice.items.map(i => ({
        product: i.product?._id || i.product,
        quantity: i.quantity,
        price: i.price
      })),
      dueDate: invoice.dueDate ? invoice.dueDate.substr(0, 10) : ''
    });
    setShowCreate(false); setCreateError(''); setSelectedInvoice(null);
  };

  const handleDeleteClick = async (invoice) => {
    if (!window.confirm(`Delete invoice for ${invoice.customer?.name || ''}?`)) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/invoices/${invoice._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Failed to delete invoice');
      } else {
        fetchInvoices();
      }
    } catch {
      setError('Failed to delete invoice');
    }
    setLoading(false);
  };

  const handleCreateChange = (field, value) => {
    setNewInvoice({ ...newInvoice, [field]: value });
  };
  const handleItemChange = (idx, field, value) => {
    const items = newInvoice.items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    setNewInvoice({ ...newInvoice, items });
  };
  const addItem = () => {
    setNewInvoice({ ...newInvoice, items: [...newInvoice.items, { product: '', quantity: 1, price: 0 }] });
  };
  const removeItem = (idx) => {
    setNewInvoice({ ...newInvoice, items: newInvoice.items.filter((_, i) => i !== idx) });
  };
  const resetForm = () => {
    setNewInvoice({ customer: '', items: [{ product: '', quantity: 1, price: 0 }], dueDate: '' });
    setCreateError(''); setEditingInvoice(null); setShowCreate(false);
  };

  const handleCreateOrUpdateInvoice = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newInvoice.customer || newInvoice.items.some(item => !item.product || !item.quantity || !item.price)) {
      setCreateError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        customer: newInvoice.customer,
        items: newInvoice.items.map(item => ({
          product: item.product,
          quantity: Number(item.quantity),
          price: Number(item.price)
        })),
        dueDate: newInvoice.dueDate
      };
      if(newInvoice.saleId) payload.saleId = newInvoice.saleId;
      let res;
      if (editingInvoice) {
        res = await fetch(`/api/invoices/${editingInvoice._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const errData = await res.json();
        setCreateError(errData.error || `Failed to ${editingInvoice ? 'update' : 'create'} invoice`);
      } else {
        resetForm(); fetchInvoices();
      }
    } catch {
      setCreateError(`Failed to ${editingInvoice ? 'update' : 'create'} invoice`);
    }
    setLoading(false);
  };

  const selectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setError(''); setPaymentAmount(''); setPaymentMethod('cash');
    setPaymentNote(''); setEditingInvoice(null); setShowCreate(false);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/invoices/${selectedInvoice._id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(paymentAmount), method: paymentMethod, note: paymentNote })
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Payment failed');
      } else {
        const updated = await fetch(`/api/invoices/${selectedInvoice._id}`);
        const updatedInvoice = await updated.json();
        setSelectedInvoice(updatedInvoice);
        fetchInvoices();
      }
    } catch {
      setError('Payment failed');
    }
    setLoading(false);
  };

  // Print handler
  const handlePrint = () => {
    // Scroll to top for print, ensures printable content is in viewport
    window.scrollTo(0, 0);
    setTimeout(() => window.print(), 200);
  };

  const invoiceTotal = newInvoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price) || 0), 0);

  if (loading) return <div style={{textAlign:"center",margin:"30px"}}>Loading...</div>;

  // -------- VIEW INVOICE -------------
  if (selectedInvoice) {
    // For nice print, wrap invoice in #printable-invoice div
    return (
      <div style={styles.container}>
        <div className="no-print">
          <button onClick={() => setSelectedInvoice(null)} style={{...styles.actionBtn, background:"#888"}}>← Back to Invoices</button>
          <button style={styles.printBtn} onClick={handlePrint}>🖨️ Print Invoice</button>
        </div>
        <div id="printable-invoice" style={styles.invoiceCard} ref={printRef}>
          <h2 style={{letterSpacing:1, marginBottom:12, color:"#374151"}}>Tax Invoice</h2>
          <p>
            <span style={{fontWeight:600}}>Customer:</span>{" "}
            <span style={styles.highlight}>{selectedInvoice.customer?.name || "-"}</span><br />
            <span style={{fontWeight:600}}>Status:</span> <span>{selectedInvoice.status || '-'}</span><br />
            <span style={{fontWeight:600}}>Total:</span> <span style={styles.highlight}>{formatCurrency(selectedInvoice.total)}</span><br />
            <span style={{fontWeight:600}}>Due Date:</span> <span>{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : '-'}</span>
          </p>
          <h3 style={{margin:"14px 0 0 0"}}>Items</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{item.product?.name}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>{formatCurrency(item.price)}</td>
                  <td style={styles.td}>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Payments</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {(selectedInvoice.payments && selectedInvoice.payments.length > 0) ? (
                selectedInvoice.payments.map((p, idx) => (
                  <tr key={p._id || idx}>
                    <td style={styles.td}>{formatCurrency(p.amount)}</td>
                    <td style={styles.td}>{p.method}</td>
                    <td style={styles.td}>{p.date ? new Date(p.date).toLocaleDateString() : ''}</td>
                    <td style={styles.td}>{p.note}</td>
                  </tr>
                ))
              ) : <tr><td style={styles.td} colSpan={4}>No payments yet</td></tr>}
            </tbody>
          </table>
          {/* Payment record form */}
          {selectedInvoice.status !== 'paid' && (
            <form className="no-print" onSubmit={handlePayment} style={{ marginTop: 20, background: '#f5f5f5', padding: 14, borderRadius: 6 }}>
              <h4 style={{marginTop:0}}>Record Payment</h4>
              <div style={{ marginBottom: 8 }}>
                <input type="number" placeholder="Amount" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} min="1" required style={{ width: 120 }} />
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ marginLeft: 8 }}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                  <option value="other">Other</option>
                </select>
                <input type="text" placeholder="Note (optional)" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} style={{ marginLeft: 8, width: 180 }} />
                <button type="submit" style={{ marginLeft: 8, ...styles.actionBtn }}>Add Payment</button>
              </div>
            </form>
          )}
        </div>
        {error && <div className="no-print" style={{ color: 'red' }}>{error}</div>}
      </div>
    );
  }

  // -------- CREATE/EDIT FORM -------------
  if (showCreate || editingInvoice) {
    return (
      <div style={styles.container}>
        <button className="no-print" onClick={resetForm} style={{...styles.actionBtn, background:"#888"}}>← Back to Invoices</button>
        <div style={styles.invoiceCard}>
          <h3 style={{ marginTop: 0, letterSpacing:.4 }}>{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</h3>
          <form onSubmit={handleCreateOrUpdateInvoice}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ width: 100, display: 'inline-block' }}>Customer: </label>
              <select value={newInvoice.customer} onChange={e => handleCreateChange('customer', e.target.value)} required style={{ width: 220 }}>
                <option value="">Select customer</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ width: 100, display: 'inline-block' }}>Due Date: </label>
              <input type="date" value={newInvoice.dueDate} onChange={e => handleCreateChange('dueDate', e.target.value)} style={{ width: 180 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ width: 100, display: 'inline-block', verticalAlign: 'top' }}>Items:</label>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Quantity</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Subtotal</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {newInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>
                        <select value={item.product} onChange={e => handleItemChange(idx, 'product', e.target.value)} required>
                          <option value="">Product</option>
                          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td style={styles.td}><input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} style={{ width: 60 }} required /></td>
                      <td style={styles.td}><input type="number" min="0" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} style={{ width: 80 }} required /></td>
                      <td style={styles.td}>{formatCurrency(item.quantity * item.price)}</td>
                      <td style={styles.td}>
                        <button type="button" onClick={() => removeItem(idx)} disabled={newInvoice.items.length === 1} style={{...styles.dangerBtn,margin:0,padding:"1px 10px",fontSize:14}}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              
              <button className="no-print" type="button" onClick={addItem} style={{ ...styles.actionBtn, marginLeft: 8 }}>Add Item</button>
            </div>
            <div style={{ marginBottom: 12, fontWeight: 'bold' }}>Total: {formatCurrency(invoiceTotal)}</div>
            <div>
              <button className="no-print" type="submit" disabled={!newInvoice.customer || newInvoice.items.some(item => !item.product || !item.quantity || !item.price)}>
                {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
              </button>
              <button className="no-print" type="button" onClick={resetForm} style={{ marginLeft: 8, ...styles.actionBtn, background:"#888" }}>Reset</button>
            </div>
            {createError && <div className="no-print" style={{ color: 'red', marginTop: 8 }}>{createError}</div>}
          </form>
        </div>
      </div>
    );
  }

  // -------- LIST ALL INVOICES -------------
  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: 16, letterSpacing:1, fontWeight:600, color:"#2e3b4e", fontSize:32 }}>Invoices</h2>
      <div style={{ marginBottom: 20 }}>
        <button className="no-print" onClick={() => { setShowCreate(!showCreate); setEditingInvoice(null); resetForm(); }} style={styles.actionBtn}>
          {showCreate ? 'Cancel' : 'Create Invoice'}
        </button>
      </div>
      <table style={styles.table} border="0" cellPadding="5">
        <thead>
          <tr>
            <th style={styles.th}>Customer</th>
            <th style={styles.th}>Total</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Due Date</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv._id} style={{background: inv.status==='paid' ? "#e5faea":"#fff"}}>
              <td style={styles.td}>{inv.customer?.name}</td>
              <td style={{...styles.td,fontWeight:600,color:"#229954"}}>{formatCurrency(inv.total)}</td>
              <td style={styles.td}>{inv.status}</td>
              <td style={styles.td}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td>
              <td style={styles.td}>
                <button className="no-print" onClick={() => selectInvoice(inv)} style={styles.actionBtn}>View</button>
                <button className="no-print" onClick={() => handleEditClick(inv)} style={{ ...styles.actionBtn, background: "#f6e05e", color: "#121", fontWeight: 500 }}>Edit</button>
                <button className="no-print" onClick={() => handleDeleteClick(inv)} style={styles.dangerBtn}>Delete</button>
                <button className="no-print" onClick={() => { setSelectedInvoice(inv); setTimeout(handlePrint, 400); }} style={styles.printBtn}>Print</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div className="no-print" style={{ color: 'red' }}>{error}</div>}
      <div style={{margin:"34px 0 0 0", color:"#778", fontSize:13, textAlign:"center"}}>Enjoy Enjoy</div>
    </div>
  );
}
