require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./src/db');
const protect = require('./src/middlewares/authMiddleware');
const authorizeRoles = require('./src/middlewares/roleMiddleware');


const app = express();

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('QuickServe API Running 🚀');
});
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);
app.get('/api/protected', protect, (req, res) => {
  res.json({
    message: "You accessed a protected route 🔐",
    user: req.user
  });
});

app.get(
  '/api/admin-only',
  protect,
  authorizeRoles('admin'),
  (req, res) => {
    res.json({
      message: "Welcome Admin 👑"
    });
  }
);
const providerRoutes = require('./src/routes/providerRoutes');
app.use('/api/providers', providerRoutes);

const categoriesRoutes = require('./src/routes/categoriesRoutes');
app.use('/api/categories', categoriesRoutes);

const serviceRoutes = require('./src/routes/serviceRoutes');
app.use('/api/services', serviceRoutes);

// availability endpoints for providers
const availabilityRoutes = require('./src/routes/availabilityRoutes');
app.use('/api/availability', availabilityRoutes);

// bookings
const bookingRoutes = require('./src/routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

// admin section
const adminRoutes = require('./src/routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// notifications
const notificationRoutes = require('./src/routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// messages
const messageRoutes = require('./src/routes/messageRoutes');
app.use('/api/messages', messageRoutes);

const customerRoutes = require('./src/routes/customerRoutes');// error handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  res.status(500).json({
    message: "Global server error",
    error: err.message || err
  });
});
app.use('/api/customer', customerRoutes);

// reviews
const reviewRoutes = require('./src/routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);



process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
