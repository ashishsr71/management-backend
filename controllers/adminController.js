const Complaint = require('../models/complaintModel');
const User = require('../models/userModel');

// @desc    View all complaints (for Admin) or assigned (for Officer)
// @route   GET /api/admin/complaints
// @access  Private (Officer, Admin)
exports.getAllComplaints = async (req, res) => {
  let query = {};
  
  // If user is an officer, only show complaints assigned to them
  if (req.user.role === 'officer') {
    query = { assignedTo: req.user._id };
  }
  // Admin sees all (empty query)

  // Add filters from query params, e.g., /api/admin/complaints?status=Submitted
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.department) {
    query.department = req.query.department;
  }

  const complaints = await Complaint.find(query)
    .populate('user', 'name')
    .populate('department', 'name')
    .sort({ createdAt: -1 });
    
  res.json(complaints);
};

// @desc    Assign a complaint to an officer
// @route   PUT /api/admin/complaints/:id/assign
// @access  Private (Admin)
exports.assignComplaint = async (req, res) => {
  const { officerId } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const officer = await User.findById(officerId);
    if (!officer || officer.role !== 'officer') {
      return res.status(400).json({ message: 'Invalid officer ID' });
    }
    
    complaint.assignedTo = officerId;
    complaint.status = 'InProgress';
    complaint.updates.push({
      comment: `Assigned to officer ${officer.name}`,
      status: 'InProgress',
      updatedBy: req.user._id
    });
    
    await complaint.save();
    
    // TODO: Notify officer
    
    res.json({ message: 'Complaint assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Generate summary reports
// @route   GET /api/admin/reports/summary
// @access  Private (Admin)
exports.getReportSummary = async (req, res) => {
  try {
    // 1. Count by status
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Count by department
    const deptCounts = await Complaint.aggregate([
      { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $group: { _id: '$dept.name', count: { $sum: 1 } } }
    ]);
    
    // 3. Average resolution time
    const avgResolution = await Complaint.aggregate([
      { $match: { status: { $in: ['Resolved', 'Closed'] } } },
      {
        $project: {
          resolutionTime: { $subtract: ['$updatedAt', '$createdAt'] }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$resolutionTime' }
        }
      }
    ]);
    
    const avgTimeInMs = avgResolution[0] ? avgResolution[0].avgTime : 0;
    // Convert to days/hours/minutes
    const avgDays = Math.floor(avgTimeInMs / (1000 * 60 * 60 * 24));
    
    res.json({
      statusCounts,
      deptCounts,
      averageResolutionTime: `${avgDays} days` // Simplified
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error generating reports', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const query = {};
    
    // Check for query param ?role=officer
    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query).select('-passwordHash'); // Find users, remove password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};