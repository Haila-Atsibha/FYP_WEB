const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const {
    sendMessage,
    getMessagesByBooking,
    getConversations
} = require('../controllers/messageController');

// All message routes require authentication
router.use(protect);

// Get all conversations for the logged-in user (customer or provider)
router.get('/conversations', getConversations);

// Get messages for a specific booking
router.get('/booking/:booking_id', getMessagesByBooking);

// Send a message
router.post('/', sendMessage);

module.exports = router;
