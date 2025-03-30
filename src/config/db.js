const mongoose = require('mongoose');

// Track connection status
let isConnected = false;
let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;

exports.connectDB = async () => {
  // If already connected, reuse connection
  if (isConnected) {
    console.log('Using existing database connection');
    return mongoose.connection;
  }

  try {
    // If we've tried too many times, fail gracefully
    if (connectionAttempts >= MAX_ATTEMPTS) {
      console.error('Maximum connection attempts reached. Giving up.');
      throw new Error('Unable to connect to database after multiple attempts');
    }

    connectionAttempts++;
    console.log(`Connection attempt ${connectionAttempts} of ${MAX_ATTEMPTS}`);

    // Add direct connection to avoid DNS issues
    const connectionString = process.env.MONGODB_URI;
    
    // Connection options optimized for Vercel serverless
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased from 5000
      socketTimeoutMS: 60000,          // Increased from 45000
      maxPoolSize: 10,
      connectTimeoutMS: 30000,         // Increased from 10000
      heartbeatFrequencyMS: 30000,     // Added heartbeat option
      retryWrites: true,               // Added retry options
      retryReads: true,
      w: 'majority'                    // Added write concern
    });

    // Reset counter on successful connection
    connectionAttempts = 0;
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    
    // Don't exit process in serverless environment
    if (!process.env.VERCEL) {
      if (connectionAttempts >= MAX_ATTEMPTS) {
        process.exit(1);
      }
    }
    
    throw error;
  }
};

// Keep disconnectDB as is
exports.disconnectDB = async () => {
  if (isConnected) {
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connection.dropDatabase();
    }
    await mongoose.connection.close();
    isConnected = false;
    connectionAttempts = 0;
    console.log('Database connection closed');
  }
};

// Add monitoring for reconnection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
  isConnected = true;
});

// Handle errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});