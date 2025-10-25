const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintUpdateSchema = new mongoose.Schema({
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' }, // The assigned officer
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Submitted', 'InProgress', 'Resolved', 'Closed'],
    default: 'Submitted'
  },
  attachmentPath: { type: String }, // Path to the uploaded file
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updates: [complaintUpdateSchema] // Embeds the history directly
});

module.exports = mongoose.model('Complaint', complaintSchema);