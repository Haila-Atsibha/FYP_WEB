require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const providerRoutes = require('./src/routes/providerRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const categoriesRoutes = require('./src/routes/categoriesRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const availabilityRoutes = require('./src/routes/availabilityRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const platformRatingRoutes = require('./src/routes/platformRatingRoutes');
const customerRoutes = require('./src/routes/customerRoutes');

// Import middlewares
const protect = require('./src/middlewares/authMiddleware');
const authorizeRoles = require('./src/middlewares/roleMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', platformRatingRoutes);
app.use('/api/customer', customerRoutes);

// Custom protected test routes (from test.rest)
app.get('/api/protected', protect, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

app.get('/api/admin-only', protect, authorizeRoles('admin'), (req, res) => {
    res.json({ message: "Welcome, Admin!" });
});

app.get('/', (req, res) => {
    res.send('QuickServe Backend API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
