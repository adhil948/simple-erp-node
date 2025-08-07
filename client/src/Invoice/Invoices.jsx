import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

import { styles, printCSS } from './styles';
import { formatCurrency } from './utils';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';
import InvoiceView from './InvoiceView';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

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
  const [newInvoice, setNewInvoice] = useState({ customer: '', items: [{ product: '', quantity: 1, price: 0 }],discount:0, dueDate: '' });
  const [createError, setCreateError] = useState('');
  // Add this state to your main Invoices component
const [paymentModalOpen, setPaymentModalOpen] = useState(false);
 const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // const [discount, setDiscount] = useState(0);

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
    fetch(`${API_BASE_URL}/api/customers`).then(r => r.json()).then(setCustomers).catch(() => setCustomers([]));
    fetch(`${API_BASE_URL}/api/products`).then(r => r.json()).then(setProducts).catch(() => setProducts([]));
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
        dueDate: '',
        discount:0
      });
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line
  }, [location.state]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`);
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
        price: i.price,
      })),
      discount:invoice.discount || 0,
      dueDate: invoice.dueDate ? invoice.dueDate.substr(0, 10) : ''
    });
    setShowCreate(false); setCreateError(''); setSelectedInvoice(null);
  };

  const handleDeleteClick = async (invoice) => {
    if (!window.confirm(`Delete invoice for ${invoice.customer?.name || ''}?`)) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}`, { method: 'DELETE' });
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
    setNewInvoice({ customer: '', items: [{ product: '', quantity: 1, price: 0 }], discount:0,dueDate: '' });
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
      dueDate: newInvoice.dueDate,
      discount: Number(newInvoice.discount) || 0,
      // ADD THIS LINE - Include payment schedule in payload
      paymentSchedule: newInvoice.paymentSchedule || []
    };

    console.log('Payload being sent:', payload);
    console.log('newInvoice.discount:', newInvoice.discount);
    console.log('paymentSchedule being sent:', payload.paymentSchedule); // Add this debug log

    if(newInvoice.saleId) payload.saleId = newInvoice.saleId;
    
    let res;
    if (editingInvoice) {
      res = await fetch(`${API_BASE_URL}/api/invoices/${editingInvoice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      console.log('Creating new invoice with payload:', payload);
      res = await fetch(`${API_BASE_URL}/api/invoices/`, {
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
  console.log('handlePayment called with:', {
    paymentAmount,
    paymentMethod,
    paymentNote,
    selectedInvoiceId: selectedInvoice?._id
  });

  if (!paymentAmount) {
    console.log('No payment amount provided');
    return;
  }

  if (!selectedInvoice?._id) {
    console.log('No selected invoice ID');
    setError('No invoice selected');
    return;
  }

  setLoading(true);
  setError('');
  
  try {
    console.log('Sending payment request...');
    const res = await fetch(`${API_BASE_URL}/api/invoices/${selectedInvoice._id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        amount: Number(paymentAmount), 
        method: paymentMethod, 
        note: paymentNote 
      })
    });

    console.log('Payment response status:', res.status);

    if (!res.ok) {
      const errData = await res.json();
      console.log('Payment error response:', errData);
      setError(errData.error || 'Payment failed');
    } else {
      console.log('Payment successful, fetching updated invoice...');
      const updated = await fetch(`${API_BASE_URL}/api/invoices/${selectedInvoice._id}`);
      const updatedInvoice = await updated.json();
      console.log('Updated invoice:', updatedInvoice);
      
      setSelectedInvoice(updatedInvoice);
      setPaymentAmount('');
      setPaymentMethod('cash');
      setPaymentNote('');
      fetchInvoices();
    }
  } catch (err) {
    console.error('Payment error:', err);
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
      fetch(`${API_BASE_URL}/api/invoices/${routeInvoiceId}`)
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
              paymentModalOpen={paymentModalOpen}
      setPaymentModalOpen={setPaymentModalOpen}
        setScheduleModalOpen={setScheduleModalOpen}
        scheduleModalOpen={scheduleModalOpen}
        // discount={discount}
        // setDiscount={setDiscount}
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
        setNewInvoice={setNewInvoice} 
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
