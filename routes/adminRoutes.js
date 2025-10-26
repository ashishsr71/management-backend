const express = require('express');
const router = express.Router();
const { getAllComplaints, assignComplaint, getReportSummary,getUsers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Officer & Admin route
router.get('/complaints', protect, authorize('admin', 'officer'), getAllComplaints);

// Admin-only routes
router.put('/complaints/:id/assign', protect, authorize('admin'), assignComplaint);
router.get('/reports/summary', protect, authorize('admin'), getReportSummary);
router.get('/users', protect, authorize('admin'), getUsers);
// TODO: Add routes for managing users and departments (CRUD)

module.exports = router;