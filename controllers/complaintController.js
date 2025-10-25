const Complaint = require('../models/complaintModel');
const User = require('../models/userModel');
const Department = require('../models/departmentModel');

// @desc    Lodge a new complaint
// @route   POST /api/complaints
// @access  Private (User)
exports.lodgeComplaint = async (req, res) => {
  const { title, description, departmentId, category, priority } = req.body;

  try {
    const complaint = await Complaint.create({
      user: req.user._id,
      title,
      description,
      department: departmentId,
      category,
      priority,
      attachmentPath: req.file ? req.file.path : null, // From uploadMiddleware
      status: 'Submitted',
      updates: [{ // Initial update
        comment: 'Complaint Submitted',
        status: 'Submitted',
        updatedBy: req.user._id
      }]
    });
    
    // TODO: Trigger email notification to user and admin
    
    res.status(201).json(complaint);
  } catch (error) {
    res.status(400).json({ message: 'Failed to lodge complaint', error: error.message });
  }
};

// @desc    View all complaints for the logged-in user
// @route   GET /api/complaints/my-complaints
// @access  Private (User)
exports.getMyComplaints = async (req, res) => {
  const complaints = await Complaint.find({ user: req.user._id })
    .populate('department', 'name')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 });
    
  res.json(complaints);
};

// @desc    View a single complaint's details
// @route   GET /api/complaints/:id
// @access  Private (User, Officer, Admin)
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email')
      .populate('department', 'name')
      .populate('assignedTo', 'name email')
      .populate('updates.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Security Check: User can only see their own. Officer/Admin can see all.
    if (complaint.user._id.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({ message: 'Not authorized to view this complaint' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update complaint status (by Officer/Admin)
// @route   PUT /api/complaints/:id/update
// @access  Private (Officer, Admin)
exports.updateComplaintStatus = async (req, res) => {
  const { status, comment } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Create the new update record
    const newUpdate = {
      comment,
      status,
      updatedBy: req.user._id
    };
    
    complaint.updates.push(newUpdate);
    complaint.status = status;
    complaint.updatedAt = Date.now();

    const updatedComplaint = await complaint.save();
    
    // TODO: Trigger email notification to user about the update
    
    res.json(updatedComplaint);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update complaint', error: error.message });
  }
};