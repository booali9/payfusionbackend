const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./src/config/db');
const { errorHandler } = require('./src/utils/errorHandler');

dotenv.config();

// Initialize express app
const app = express();

// Apply middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database outside of the request handler for Vercel
let dbPromise;
if (process.env.VERCEL) {
  dbPromise = connectDB();
}

// Add root path handler
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'PayFusion API Server',
    status: 'online',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // For Vercel, ensure DB is connected with each request
    if (process.env.VERCEL && dbPromise) {
      await dbPromise;
    }
    res.status(200).json({ status: 'ok', message: 'Server is running' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/kyc', require('./src/routes/kyc.routes'));
app.use('/api/transactions', require('./src/routes/transaction.routes'));
app.use('/api/wallet', require('./src/routes/wallet.routes'));
// Add new routes
app.use('/api/investment', require('./src/routes/investment.routes'));
app.use('/api/virtual-cards', require('./src/routes/virtualCard.routes'));
app.use('/api/receive-money', require('./src/routes/moneyReceive.routes'));

app.use('/uploads', express.static('uploads'));
app.use(errorHandler);

// For local development
const PORT = process.env.PORT || 5000;

if (require.main === module && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Database connection failed', err);
      process.exit(1);
    });
}

// For Vercel serverless deployment
module.exports = app;