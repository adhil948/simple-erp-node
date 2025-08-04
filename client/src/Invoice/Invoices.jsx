import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

import { styles, printCSS } from './styles';
import { formatCurrency } from './utils';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';
import InvoiceView from './InvoiceView';

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
  const [discount, setDiscount] = useState(0);

  const location = useLocation();
  const printRef = useRef();

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

  const handleCreateChange = (field, value) => setNewInvoice({ ...newInvoice, [field]: value });

  const handleItemChange = (idx, field, value) => {
    const items = newInvoice.items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    setNewInvoice({ ...newInvoice, items });
  };
  const addItem = () => setNewInvoice({ ...newInvoice, items: [...newInvoice.items, { product: '', quantity: 1, price: 0 }] });
  const removeItem = (idx) => setNewInvoice({ ...newInvoice, items: newInvoice.items.filter((_, i) => i !== idx) });
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
        const createdInvoice = await res.json();
        resetForm(); 
        setSelectedInvoice(createdInvoice);
        fetchInvoices();
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
    window.scrollTo(0, 0);
    setTimeout(() => window.print(), 200);
  };
  const { id: routeInvoiceId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (routeInvoiceId) {
      fetch(`/api/invoices/${routeInvoiceId}`)
        .then(r => r.json())
        .then(inv => setSelectedInvoice(inv))
        .catch(() => setSelectedInvoice(null));
    }
  },[routeInvoiceId]);

  if (loading) return <div style={{textAlign:"center",margin:"30px"}}>Loading...</div>;

  if (selectedInvoice) {
    return (
      <InvoiceView
        selectedInvoice={selectedInvoice}
        setSelectedInvoice={setSelectedInvoice}
        handlePrint={handlePrint}
        error={error}
        handlePayment={handlePayment}
        paymentAmount={paymentAmount}
        paymentMethod={paymentMethod}
        paymentNote={paymentNote}
        setPaymentAmount={setPaymentAmount}
        setPaymentMethod={setPaymentMethod}
        setPaymentNote={setPaymentNote}
        discount={discount}
        setDiscount={setDiscount}
      />
    );
  }

  if (showCreate || editingInvoice) {
    return (
      <InvoiceForm
        editingInvoice={editingInvoice}
        resetForm={resetForm}
        newInvoice={newInvoice}
        customers={customers}
        products={products}
        handleCreateOrUpdateInvoice={handleCreateOrUpdateInvoice}
        handleCreateChange={handleCreateChange}
        handleItemChange={handleItemChange}
        addItem={addItem}
        removeItem={removeItem}
        createError={createError}
      />
    );
  }


  // Main list view
  return (
    <InvoiceList
      invoices={invoices}
      selectInvoice={selectInvoice}
      handleEditClick={handleEditClick}
      handleDeleteClick={handleDeleteClick}
      showCreate={showCreate}
      setShowCreate={setShowCreate}
      setEditingInvoice={setEditingInvoice}
      resetForm={resetForm}
      error={error}
      setSelectedInvoice={setSelectedInvoice}
      handlePrint={handlePrint}
    />
  );
}
