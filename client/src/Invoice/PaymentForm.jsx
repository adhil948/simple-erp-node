import React, { useState } from 'react';
import styles from './invoiceStyles';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function PaymentForm({ invoiceId, setSelectedInvoice, refreshInvoices }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), method, note }),
    });
    const updated = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`).then(res => res.json());
    setSelectedInvoice(updated);
    refreshInvoices();
    setAmount('');
    setNote('');
  };

  return (
    <form onSubmit={submit} style={{ marginTop: 16 }}>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Amount" />
      <select value={method} onChange={e => setMethod(e.target.value)}>
        <option value="cash">Cash</option>
        <option value="card">Card</option>
      </select>
      <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Note" />
      <button type="submit" style={styles.actionBtn}>Add Payment</button>
    </form>
  );
}
