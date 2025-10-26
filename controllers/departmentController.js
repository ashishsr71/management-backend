const Department = require('../models/departmentModel');
const Complaint = require('../models/complaintModel');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
  const { name, description } = req.body;

  try {
    const departmentExists = await Department.findOne({ name });

    if (departmentExists) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await Department.create({
      name,
      description,
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (All authenticated users)
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 }); // Sort alphabetically
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private (Admin)
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (department) {
      res.json(department);
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
exports.updateDepartment = async (req, res) => {
  const { name, description } = req.body;

  try {
    const department = await Department.findById(req.params.id);

    if (department) {
      department.name = name || department.name;
      department.description = description || department.description;

      const updatedDepartment = await department.save();
      res.json(updatedDepartment);
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Safety Check: Prevent deletion if a complaint is using this department
    const complaintInUse = await Complaint.findOne({ department: req.params.id });
    if (complaintInUse) {
      return res.status(400).json({ message: 'Cannot delete. Department is linked to active complaints.' });
    }

    await department.deleteOne(); // Use deleteOne()
    res.json({ message: 'Department removed' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};