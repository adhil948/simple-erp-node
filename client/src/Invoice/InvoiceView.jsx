// InvoiceView.js
import React, { useRef, useState } from "react";
import { styles } from "./styles";
import { formatCurrency } from "./utils";

// Simple Modal (or replace with your modal library)
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.28)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          minWidth: 540,
          maxWidth: 800,
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        <button
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            fontSize: 22,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={onClose}
          aria-label="Close Modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function InvoiceView({
  selectedInvoice,
  setSelectedInvoice,
  handlePayment,
  error,
  paymentAmount,
  paymentMethod,
  paymentNote,
  setPaymentAmount,
  setPaymentMethod,
  setPaymentNote,
  paymentModalOpen,
  setPaymentModalOpen,
  setScheduleModalOpen,
  scheduleModalOpen,
}) {
  const invoiceRef = useRef();
  const receiptRef = useRef();

  const discount = selectedInvoice.discount || 0;

  // Calculate subtotal of items
  const itemsSubtotal = selectedInvoice.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const appliedDiscount = Number(discount) || 0;
  const grandTotal = itemsSubtotal - appliedDiscount;

  // Helper function to get schedule status
  const getScheduleStatus = (schedule) => {
    const currentDate = new Date();
    const dueDate = new Date(schedule.dueDate);
    const paidAmount = schedule.paidAmount || 0;
    
    if (paidAmount >= schedule.amount) {
      return { status: 'paid', color: '#28a745', text: 'Paid' };
    } else if (dueDate < currentDate && paidAmount < schedule.amount) {
      return { status: 'overdue', color: '#dc3545', text: 'Overdue' };
    } else {
      return { status: 'pending', color: '#ffc107', text: 'Pending' };
    }
  };

  // Calculate schedule totals
const scheduleStats = () => {
  if (!selectedInvoice.paymentSchedule || selectedInvoice.paymentSchedule.length === 0) {
    return { totalScheduled: 0, totalPaid: 0, remaining: grandTotal };
  }

  const totalScheduled = selectedInvoice.paymentSchedule.reduce(
    (sum, schedule) => sum + schedule.amount, 0
  );
  
  // Calculate total paid from actual payments instead of schedule.paidAmount
  const totalPaidFromPayments = selectedInvoice.payments?.reduce(
    (sum, payment) => sum + (payment.amount || 0), 0
  ) || 0;
  
  // Use the minimum of scheduled amount and actual payments made
  const totalPaid = Math.min(totalPaidFromPayments, totalScheduled);
  const remaining = totalScheduled - totalPaid;

  return { totalScheduled, totalPaid, remaining };
};

  const { totalScheduled, totalPaid, remaining } = scheduleStats();

  // Print functions
  function handlePrintInvoice() {
    if (invoiceRef.current) {
      const printContents = invoiceRef.current.innerHTML;
      const win = window.open("", "", "width=900,height=1200");
      win.document.write("<html><head><title>Invoice</title>");
      win.document.write(
        "<style>body{font-family:sans-serif;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;} th{background:#f8f8f8;}</style>"
      );
      win.document.write("</head><body>");
      win.document.write(printContents);
      win.document.write("</body></html>");
      win.document.close();
      win.focus();
      win.print();
      win.close();
    }
  }

  function handlePrintReceipt() {
    if (receiptRef.current) {
      const printContents = receiptRef.current.innerHTML;
      const win = window.open("", "", "width=700,height=600");
      win.document.write("<html><head><title>Payment Receipt</title>");
      win.document.write(
        "<style>body{font-family:sans-serif;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;} th{background:#f8f8f8;}</style>"
      );
      win.document.write("</head><body>");
      win.document.write(printContents);
      win.document.write("</body></html>");
      win.document.close();
      win.focus();
      win.print();
      win.close();
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={styles.container}>
      {/* TOP Action Buttons */}
      <div className="no-print" style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => setSelectedInvoice(null)}
          style={{ ...styles.actionBtn, background: "#888" }}
        >
          ← Back to Invoices
        </button>
        <button style={styles.printBtn} onClick={handlePrintInvoice}>
          🖨️ Print Invoice
        </button>
        <button
          style={styles.actionBtn}
          onClick={() => setPaymentModalOpen(true)}
        >
          💳 Payments
        </button>
        <button 
          style={{
            ...styles.actionBtn,
            background: selectedInvoice.paymentSchedule && selectedInvoice.paymentSchedule.length > 0 ? "#17a2b8" : "#6c757d"
          }} 
          onClick={() => setScheduleModalOpen(true)}
        >
          📅 Payment Schedule
        </button>
      </div>

      {/* INVOICE SECTION */}
      <div id="printable-invoice" style={styles.invoiceCard} ref={invoiceRef}>
        {/* Company Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              letterSpacing: 0.8,
              color: "#2e3b4e",
            }}
          >
            Star Fitness Equipment Pvt. Ltd.
          </h1>
          <p style={{ margin: 4, fontSize: 14, color: "#555" }}>
            102, Industrial Estate, Phase 1, Trivandrum, Kerala - 695001, India
            <br />
            Phone: +91 98765 43210 | Email: support@starfitness.com | GSTIN:
            32ABCDE1234F1Z5
          </p>
          <h2
            style={{
              letterSpacing: 1,
              marginTop: 16,
              marginBottom: 12,
              color: "#374151",
            }}
          >
            Tax Invoice
          </h2>
        </div>

        {/* Customer and Invoice Details */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 40,
            marginBottom: 20,
          }}
        >
          {/* Left: Customer Details */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, marginBottom: 4 }}>
              <strong>Customer:</strong>
              <br />
              <span style={styles.highlight}>
                {selectedInvoice.customer?.name || "-"}
              </span>
            </p>
            <p style={{ fontSize: 14, marginBottom: 4 }}>
              <strong>GSTIN:</strong>
              <br />
              <span style={styles.highlight}>
                {selectedInvoice.customer?.gstIN || "-"}
              </span>
            </p>
            <p style={{ fontSize: 14 }}>
              <strong>Billing Address:</strong>
              <br />
              <span style={styles.highlight}>
                {selectedInvoice.customer?.address
                  ? `${selectedInvoice.customer.address.street}, ${selectedInvoice.customer.address.city}, ${selectedInvoice.customer.address.state} - ${selectedInvoice.customer.address.zip}, ${selectedInvoice.customer.address.country}`
                  : "-"}
              </span>
            </p>
          </div>
          {/* Right: Invoice Details */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, marginBottom: 4 }}>
              <strong>Status:</strong>
              <br />
              <span>{selectedInvoice.status || "-"}</span>
            </p>
            <p style={{ fontSize: 14, marginBottom: 4 }}>
              <strong>Total:</strong>
              <br />
              <span style={styles.highlight}>{formatCurrency(grandTotal)}</span>
            </p>
            <p style={{ fontSize: 14 }}>
              <strong>Issued Date:</strong>
              <br />
              <span>{formatDate(selectedInvoice.createdAt)}</span>
            </p>
            <p style={{ fontSize: 14 }}>
              <strong>Due Date:</strong>
              <br />
              <span>{formatDate(selectedInvoice.dueDate)}</span>
            </p>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <h3 style={{ margin: "14px 0 0 0" }}>Items</h3>
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
                <td style={styles.td}>
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* DISCOUNT AND TOTAL */}
        <div style={{ marginLeft: "auto", marginTop: 12, maxWidth: 360 }}>
          <table style={{ width: "100%", fontSize: 16 }}>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "6px 4px",
                    fontWeight: 500,
                    textAlign: "right",
                  }}
                >
                  Subtotal:
                </td>
                <td style={{ padding: "6px 4px", textAlign: "right" }}>
                  {formatCurrency(itemsSubtotal)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "6px 4px",
                    fontWeight: 700,
                    fontSize: 18,
                    textAlign: "right",
                  }}
                >
                  Discount:
                </td>
                <td
                  style={{
                    padding: "6px 4px",
                    fontWeight: 700,
                    fontSize: 18,
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(discount)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "6px 4px",
                    fontWeight: 700,
                    fontSize: 18,
                    textAlign: "right",
                  }}
                >
                  Grand Total:
                </td>
                <td
                  style={{
                    padding: "6px 4px",
                    fontWeight: 700,
                    fontSize: 18,
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT SCHEDULE MODAL */}
      <Modal open={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)}>
        <div>
          <h2
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: 8,
              marginBottom: 14,
              marginTop: 0,
            }}
          >
            Payment Schedule for Invoice&nbsp;
            {selectedInvoice.invoiceNumber ||
              (selectedInvoice._id ? selectedInvoice._id.slice(-5) : "")}
          </h2>

          {selectedInvoice.paymentSchedule && selectedInvoice.paymentSchedule.length > 0 ? (
            <div>
              {/* Schedule Summary */}
              <div style={{
                background: "#f8f9fa",
                padding: 12,
                borderRadius: 6,
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14
              }}>
                <div><strong>Total Scheduled:</strong> {formatCurrency(totalScheduled)}</div>
                <div><strong>Total Paid:</strong> {formatCurrency(totalPaid)}</div>
                <div style={{ color: remaining > 0 ? '#dc3545' : '#28a745' }}>
                  <strong>Remaining:</strong> {formatCurrency(remaining)}
                </div>
              </div>

              {/* Schedule Table */}
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Due Date</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Paid Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.paymentSchedule.map((schedule, idx) => {
                    const statusInfo = getScheduleStatus(schedule);
                    return (
                      <tr key={idx}>
                        <td style={styles.td}>{formatDate(schedule.dueDate)}</td>
                        <td style={styles.td}>{formatCurrency(schedule.amount)}</td>
                        <td style={styles.td}>
                          {formatCurrency(schedule.paidAmount || 0)}
                        </td>
                        <td style={{
                          ...styles.td,
                          color: statusInfo.color,
                          fontWeight: 'bold'
                        }}>
                          {statusInfo.text}
                        </td>
                        <td style={styles.td}>{schedule.description || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Schedule Progress */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Payment Progress:</strong>
                </div>
                <div style={{
                  width: '100%',
                  height: 20,
                  backgroundColor: '#e9ecef',
                  borderRadius: 10,
                  overflow: 'hidden'
                }}>
<div style={{
  width: `${totalScheduled > 0 ? (totalPaid / totalScheduled) * 100 : 0}%`,
  height: '100%',
  backgroundColor: totalPaid >= totalScheduled ? '#28a745' : '#17a2b8',
  transition: 'width 0.3s ease'
}}></div>
                </div>
                <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4 }}>
                  {totalScheduled > 0 ? Math.round((totalPaid / totalScheduled) * 100) : 0}% completed
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: 40,
              color: '#6c757d'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
              <h3 style={{ marginBottom: 8 }}>No Payment Schedule</h3>
              <p>This invoice doesn't have a payment schedule configured.</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
            <button
              onClick={() => setScheduleModalOpen(false)}
              style={{ ...styles.actionBtn, background: "#888" }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* PAYMENTS MODAL */}
      <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)}>
        <div>
          <h2
            style={{
              borderBottom: "1px solid #eee",
              paddingBottom: 8,
              marginBottom: 14,
              marginTop: 0,
            }}
          >
            Payments for Invoice&nbsp;
            {selectedInvoice.invoiceNumber ||
              (selectedInvoice._id ? selectedInvoice._id.slice(-5) : "")}
          </h2>
          <div ref={receiptRef} style={{ marginBottom: 18 }}>
            {/* Receipt/template header */}
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 1 }}>
                Star Fitness Equipment Pvt. Ltd.
              </div>
              <div style={{ fontSize: 14, color: "#333", fontWeight: 500 }}>
                Invoice:&nbsp;
                {selectedInvoice.invoiceNumber ||
                  (selectedInvoice._id ? selectedInvoice._id.slice(-6) : "")}
              </div>
              <div style={{ fontSize: 13 }}>
                Customer:&nbsp;{selectedInvoice.customer?.name}
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                Date:&nbsp;{new Date().toLocaleString()}
              </div>
            </div>
            <h3 style={{ marginTop: 10 }}>Payment History</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Date & Time</th>
                  <th style={styles.th}>Note</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.payments &&
                selectedInvoice.payments.length > 0 ? (
                  selectedInvoice.payments.map((p, idx) => (
                    <tr key={p._id || idx}>
                      <td style={styles.td}>{formatCurrency(p.amount)}</td>
                      <td style={styles.td}>{p.method}</td>
                      <td style={styles.td}>
                        {p.date ? new Date(p.date).toLocaleString() : ""}
                      </td>
                      <td style={styles.td}>{p.note}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={styles.td} colSpan={4}>
                      No payments yet
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr>
                  <td style={styles.td} colSpan={4}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: 10,
                        fontWeight: "bold",
                      }}
                    >
                      <span>
                        Total Amount:{" "}
                        {formatCurrency(selectedInvoice.total || 0)}
                      </span>
                      <span>
                        Paid:{" "}
                        {formatCurrency(
                          selectedInvoice.payments?.reduce(
                            (sum, p) => sum + (p.amount || 0),
                            0
                          )
                        )}
                      </span>
                      <span>
                        Remaining:{" "}
                        {formatCurrency(
                          (selectedInvoice.total || 0) -
                            (selectedInvoice.payments?.reduce(
                              (sum, p) => sum + (p.amount || 0),
                              0
                            ) || 0)
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Record New Payment */}
          {selectedInvoice.status !== "paid" && (
            <form
              className="no-print"
              onSubmit={handlePayment}
              style={{
                marginTop: 10,
                background: "#f8fafc",
                padding: 14,
                borderRadius: 6,
                boxShadow: "0px 1px 2px #e7e7e7",
              }}
              autoComplete="off"
            >
              <h4 style={{ marginTop: 0 }}>Record Payment</h4>
              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <input
                  type="number"
                  placeholder="Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="1"
                  required
                  style={{ width: 120 }}
                />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ minWidth: 80 }}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  style={{ width: 170 }}
                />
                <button
                  type="submit"
                  style={{ ...styles.actionBtn, minWidth: 110 }}
                >
                  Add Payment
                </button>
              </div>
            </form>
          )}
          <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
            <button onClick={handlePrintReceipt} style={{ ...styles.printBtn }}>
              🖨️ Print Receipt
            </button>
            <button
              onClick={() => setPaymentModalOpen(false)}
              style={{ ...styles.actionBtn, background: "#888" }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="no-print" style={{ color: "red", marginTop: 10 }}>
          {error}
        </div>
      )}
    </div>
  );
}
