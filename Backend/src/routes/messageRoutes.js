const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const {
    sendMessage,
    getMessagesByBooking,
    getConversations,
    markMessagesAsRead
} = require('../controllers/messageController');

// All message routes require authentication
router.use(protect);

// Get all conversations for the logged-in user (customer or provider)
router.get('/conversations', getConversations);

// Get messages for a specific booking
router.get('/booking/:booking_id', getMessagesByBooking);

// Send a message
router.post('/', upload.single('media'), sendMessage);

// Mark as read
router.put('/booking/:booking_id/read', markMessagesAsRead);

module.exports = router;
