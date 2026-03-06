const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

router.use(protect);

router.post('/', complaintController.createComplaint);
router.get('/my', complaintController.getMyComplaints);
router.get('/', authorizeRoles('admin'), complaintController.getAllComplaints);
router.patch('/:id', authorizeRoles('admin'), complaintController.updateComplaintStatus);
router.post('/:id/reply', authorizeRoles('admin'), complaintController.replyToComplaint);

module.exports = router;
