const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  leadCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  leadName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: 150
  },
  source: {
    type: String,
    required: true,
    enum: ['Website', 'Referral', 'Cold Call', 'Exhibition', 'Social Media', 'Partner', 'Other'],
    default: 'Website'
  },
  status: {
    type: String,
    required: true,
    enum: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  expectedValue: {
    type: Number,
    min: 0,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  convertedCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  convertedOpportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', leadSchema);

