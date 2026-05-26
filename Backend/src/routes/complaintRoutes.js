const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

router.use(protect);

router.post('/', complaintController.createComplaint);
router.get('/my', complaintController.getMyComplaints);
router.get('/provider', authorizeRoles('provider'), complaintController.getProviderComplaints);
router.put('/:id/provider-response', authorizeRoles('provider'), complaintController.respondToComplaint);
router.get('/', authorizeRoles('admin'), complaintController.getAllComplaints);
router.patch('/:id', authorizeRoles('admin'), complaintController.updateComplaintStatus);
router.post('/:id/reply', authorizeRoles('admin'), complaintController.replyToComplaint);

module.exports = router;
