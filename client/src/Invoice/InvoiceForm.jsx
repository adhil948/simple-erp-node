import React from 'react';
import { styles } from './styles';
import { formatCurrency } from './utils';

export default function InvoiceForm({
  editingInvoice,
  resetForm,
  newInvoice,
  customers,
  products,
  handleCreateOrUpdateInvoice,
  handleCreateChange,
  handleItemChange,
  addItem,
  removeItem,
  createError
}) {
  const invoiceTotal = newInvoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price) || 0), 0);

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
