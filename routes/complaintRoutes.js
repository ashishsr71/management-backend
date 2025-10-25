const express = require('express');
const router = express.Router();
const { lodgeComplaint, getMyComplaints, getComplaintById, updateComplaintStatus } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// User routes
router.route('/')
  .post(protect, authorize('user'), upload, lodgeComplaint); // POST with file upload
  
router.route('/my-complaints')
  .get(protect, authorize('user'), getMyComplaints);

// Shared route
router.route('/:id')
  .get(protect, getComplaintById); // User, Officer, and Admin can all view details

// Officer/Admin route
router.route('/:id/update')
  .put(protect, authorize('officer', 'admin'), updateComplaintStatus);

module.exports = router;