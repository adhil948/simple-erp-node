const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const salesRoutes = require('./routes/sales');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const reportsRoutes = require('./routes/reports');
const expenseRoutes = require("./routes/expenses");
const invoicesRouter = require('./routes/invoices');
const path = require("path");
const paymentRouter = require('./routes/Payment');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));
  
app.use('/api/sales', salesRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportsRoutes); 
app.use('/api/expenses', expenseRoutes);
app.use('/api/invoices', invoicesRouter);
app.use('/api/payments', paymentRouter);


const PORT = process.env.PORT || 5000;





app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});