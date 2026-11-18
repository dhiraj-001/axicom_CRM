const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activityType: {
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
  description: {
    type: String,
    trim: true
  },
  activityDate: {
    type: Date,
    default: Date.now
  },
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
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Completed', 'Planned', 'Cancelled'],
    default: 'Completed'
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);

