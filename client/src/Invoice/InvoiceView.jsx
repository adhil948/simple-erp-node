import React, { useRef } from 'react';
import { styles } from './styles';
import { formatCurrency } from './utils';

export default function InvoiceView({
  selectedInvoice,
  setSelectedInvoice,
  handlePrint,
  error,
  handlePayment,
  paymentAmount,
  paymentMethod,
  paymentNote,
  setPaymentAmount,
  setPaymentMethod,
  setPaymentNote
}) {
  const printRef = useRef();

  return (
    <div style={styles.container}>
      <div className="no-print">
        <button onClick={() => setSelectedInvoice(null)} style={{...styles.actionBtn, background:"#888"}}>← Back to Invoices</button>
        <button style={styles.printBtn} onClick={handlePrint}>🖨️ Print Invoice</button>
      </div>
      <div id="printable-invoice" style={styles.invoiceCard} ref={printRef}>
        <h2 style={{letterSpacing:1, marginBottom:12, color:"#374151"}}>Tax Invoice</h2>
<div style={{ display: 'flex', justifyContent: 'space-between', gap: 40 }}>
  {/* Left: Customer Details */}
  <div style={{ flex: 1 }}>
    <p>
      <span style={{ fontWeight: 600 }}>Customer:</span>{" "}
      <span style={styles.highlight}>{selectedInvoice.customer?.name || "-"}</span><br />

      <span style={{ fontWeight: 600 }}>GST:</span>{" "}
      <span style={styles.highlight}>{selectedInvoice.customer?.gstIN || "-"}</span><br />

      <span style={{ fontWeight: 600 }}>Billing Address:</span><br />
      <span style={styles.highlight}>
        {selectedInvoice.customer?.address
          ? `${selectedInvoice.customer.address.street}, ${selectedInvoice.customer.address.city}, ${selectedInvoice.customer.address.state} - ${selectedInvoice.customer.address.zip}, ${selectedInvoice.customer.address.country}`
          : "-"}
      </span>
    </p>
  </div>

  {/* Right: Price & Invoice Details */}
  <div style={{ flex: 1, }}>
    <p>
      <span style={{ fontWeight: 600 }}>Status:</span>{" "}
      <span>{selectedInvoice.status || '-'}</span><br />

      <span style={{ fontWeight: 600 }}>Total:</span>{" "}
      <span style={styles.highlight}>{formatCurrency(selectedInvoice.total)}</span><br />

      <span style={{ fontWeight: 600 }}>Due Date:</span>{" "}
      <span>{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : '-'}</span>
    </p>
  </div>
</div>

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
