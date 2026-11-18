const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null
  },
  followUpDate: {
    type: Date,
    required: true
  },
  followUpType: {
    type: String,
    required: true,
    enum: ['Call', 'Meeting', 'Email', 'Task'],
    default: 'Call'
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  remarks: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Planned', 'Completed', 'Missed', 'Cancelled'],
    default: 'Planned'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FollowUp', followUpSchema);

