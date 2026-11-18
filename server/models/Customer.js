const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: 150
  },
  address: {
    type: String,
    trim: true,
    maxlength: 250
  },
  city: {
    type: String,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    trim: true,
    maxlength: 100
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  modifiedDate: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Customer', customerSchema);

