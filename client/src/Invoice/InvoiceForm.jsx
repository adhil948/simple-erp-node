import React, { useState } from 'react';
import { styles } from './styles';
import { formatCurrency } from './utils';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function InvoiceForm({
  editingInvoice,
  resetForm,
  newInvoice,
  setNewInvoice,
  customers,
  products,
  handleCreateOrUpdateInvoice,
  handleCreateChange,
  handleItemChange,
  addItem,
  removeItem,
  createError
}) {
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false);
  
  const invoiceTotal = newInvoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price) || 0), 0);
  const discount = Number(newInvoice.discount) || 0;
  const finalTotal = invoiceTotal - discount;

  // Initialize payment schedule if it doesn't exist
  const paymentSchedule = newInvoice.paymentSchedule || [];

  // Add new payment schedule item
  const addPaymentSchedule = () => {
    const newSchedule = {
      amount: 0,
      dueDate: '',
      description: ''
    };
    
    setNewInvoice({
      ...newInvoice,
      paymentSchedule: [...paymentSchedule, newSchedule]
    });
  };

  // Remove payment schedule item
  const removePaymentSchedule = (index) => {
    const updatedSchedule = paymentSchedule.filter((_, idx) => idx !== index);
    setNewInvoice({
      ...newInvoice,
      paymentSchedule: updatedSchedule
    });
  };

  // Update payment schedule item
  const updatePaymentSchedule = (index, field, value) => {
    const updatedSchedule = [...paymentSchedule];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [field]: field === 'amount' ? Number(value) : value
    };
    
    setNewInvoice({
      ...newInvoice,
      paymentSchedule: updatedSchedule
    });
  };

  // Calculate total scheduled amount
  const totalScheduledAmount = paymentSchedule.reduce((sum, schedule) => sum + (Number(schedule.amount) || 0), 0);
  const remainingAmount = finalTotal - totalScheduledAmount;

  // Auto-fill remaining amount for last schedule item
  const autoFillRemaining = (index) => {
    if (remainingAmount > 0) {
      updatePaymentSchedule(index, 'amount', remainingAmount);
    }
  };

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

          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
            Discount:&nbsp;
            <input
              type="number"
              min="0"
              value={discount}
              onChange={e => handleCreateChange('discount', e.target.value)}
              style={{
                width: 90,
                textAlign: 'right',
                padding: '2px 6px',
                fontWeight: 500,
                borderRadius: 4,
                border: '1px solid #ccc'
              }}
              placeholder="0"
            />
          </div>

          <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
            Grand Total: {formatCurrency(finalTotal)}
          </div>

          {/* Payment Schedule Section */}
          <div style={{ marginBottom: 12, border: '1px solid #ddd', borderRadius: 4, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontWeight: 'bold', marginRight: 12 }}>Payment Schedule:</label>
              <button
                type="button"
                onClick={() => setShowPaymentSchedule(!showPaymentSchedule)}
                style={{
                  ...styles.actionBtn,
                  padding: '4px 8px',
                  fontSize: 12,
                  background: showPaymentSchedule ? '#28a745' : '#6c757d'
                }}
              >
                {showPaymentSchedule ? 'Hide' : 'Set Schedule'}
              </button>
            </div>

            {showPaymentSchedule && (
              <div>
                {paymentSchedule.map((schedule, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: 8, 
                    padding: 8, 
                    background: '#f8f9fa', 
                    borderRadius: 4 
                  }}>
                    <input
                      type="number"
                      min="0"
                      max={finalTotal}
                      value={schedule.amount}
                      onChange={e => updatePaymentSchedule(index, 'amount', e.target.value)}
                      placeholder="Amount"
                      style={{ width: 100, marginRight: 8, padding: '4px 6px' }}
                    />
                    <input
                      type="date"
                      value={schedule.dueDate}
                      onChange={e => updatePaymentSchedule(index, 'dueDate', e.target.value)}
                      style={{ width: 140, marginRight: 8, padding: '4px 6px' }}
                    />
                    <input
                      type="text"
                      value={schedule.description}
                      onChange={e => updatePaymentSchedule(index, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      style={{ width: 150, marginRight: 8, padding: '4px 6px' }}
                    />
                    <button
                      type="button"
                      onClick={() => autoFillRemaining(index)}
                      style={{
                        padding: '4px 8px',
                        fontSize: 11,
                        background: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: 3,
                        marginRight: 8
                      }}
                      title="Fill remaining amount"
                    >
                      Auto
                    </button>
                    <button
                      type="button"
                      onClick={() => removePaymentSchedule(index)}
                      style={{
                        ...styles.dangerBtn,
                        padding: '4px 8px',
                        fontSize: 11,
                        margin: 0
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPaymentSchedule}
                  style={{
                    ...styles.actionBtn,
                    padding: '6px 12px',
                    fontSize: 12,
                    marginTop: 4
                  }}
                >
                  Add Payment Schedule
                </button>

                {/* Schedule Summary */}
                <div style={{ marginTop: 12, padding: 8, background: '#e9ecef', borderRadius: 4 }}>
                  <div style={{ fontSize: 13 }}>
                    <strong>Schedule Summary:</strong><br />
                    Total Scheduled: {formatCurrency(totalScheduledAmount)}<br />
                    Invoice Total: {formatCurrency(finalTotal)}<br />
                    <span style={{ color: remainingAmount > 0 ? '#dc3545' : '#28a745' }}>
                      {remainingAmount > 0 ? 'Remaining' : 'Excess'}: {formatCurrency(Math.abs(remainingAmount))}
                    </span>
                  </div>
                  {remainingAmount !== 0 && (
                    <div style={{ fontSize: 11, color: '#6c757d', marginTop: 4 }}>
                      {remainingAmount > 0 
                        ? 'You need to schedule the remaining amount' 
                        : 'Total scheduled amount exceeds invoice total'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            className="no-print" 
            type="submit" 
            disabled={
              !newInvoice.customer || 
              newInvoice.items.some(item => !item.product || !item.quantity || !item.price) ||
              (showPaymentSchedule && Math.abs(remainingAmount) > 0.01) // Validate payment schedule totals
            }
          >
            {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
          </button>
          <button className="no-print" type="button" onClick={resetForm} style={{ marginLeft: 8, ...styles.actionBtn, background:"#888" }}>Reset</button>

          {createError && <div className="no-print" style={{ color: 'red', marginTop: 8 }}>{createError}</div>}
          
          {/* Validation Messages */}
          {showPaymentSchedule && Math.abs(remainingAmount) > 0.01 && (
            <div className="no-print" style={{ color: '#dc3545', marginTop: 8, fontSize: 13 }}>
              Payment schedule must equal the invoice total to proceed.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
