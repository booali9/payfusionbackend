const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./src/config/db');
const { errorHandler } = require('./src/utils/errorHandler');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add health check endpoint BEFORE routes and error handler
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/kyc', require('./src/routes/kyc.routes'));
app.use('/api/transactions', require('./src/routes/transaction.routes'));
app.use('/api/wallet', require('./src/routes/wallet.routes'));
app.use('/uploads', express.static('uploads'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
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

module.exports = app;