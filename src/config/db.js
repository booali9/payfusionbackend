const mongoose = require('mongoose');

// Track connection status
let isConnected = false;

exports.connectDB = async () => {
  // If already connected, reuse connection
  if (isConnected) {
    console.log('Using existing database connection');
    return mongoose.connection;
  }

  try {
    // Connection options optimized for serverless
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Lower server selection timeout
      socketTimeoutMS: 45000, // How long sockets stay open idle
      maxPoolSize: 10, // Maintain up to 10 connections
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      bufferCommands: false, // Disable buffering for faster response
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't exit process in serverless environment
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error; // Re-throw for handling in serverless context
  }
};

// Add this to handle connection closing (for non-serverless environments)
exports.disconnectDB = async () => {
  if (isConnected) {
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connection.dropDatabase();
    }
    await mongoose.connection.close();
    isConnected = false;
    console.log('Database connection closed');
  }
};