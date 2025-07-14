const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const salesRoutes = require('./routes/sales');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const reportsRoutes = require('./routes/reports');
const expenseRoutes = require("./routes/expenses");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect("mongodb://127.0.0.1:27017/erpDB");
  
  mongoose.connection.once("open", () => {
    console.log("✅ Connected to MongoDB");
  }).on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
  });
  
app.use('/api/sales', salesRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportsRoutes); 
app.use('/api/expenses', expenseRoutes);




const port = 3000;




app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});