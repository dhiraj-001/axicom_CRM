const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: {
    type: String,
    default: null
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  entityName: {
    type: String,
    required: true,
    trim: true
  },
  recordId: {
    type: String,
    default: null
  },
  oldValue: {
    type: String,
    default: null
  },
  newValue: {
    type: String,
    default: null
  },
  result: {
    type: String,
    enum: ['Success', 'Failed', 'Security Alert'],
    default: 'Success'
  },
  ipAddress: {
    type: String,
    default: null
  },
  createdDate: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

