const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

const { protect, authorize } = require('../middleware/auth');

// === Routes ===

// Create a department (Admin)
// Get all departments (Any logged-in user for the dropdown)
router.route('/')
  .post(protect, authorize('admin'), createDepartment)
  .get(protect, getDepartments);

// Get, Update, and Delete a specific department (Admin only)
router.route('/:id')
  .get(protect, authorize('admin'), getDepartmentById)
  .put(protect, authorize('admin'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

module.exports = router;