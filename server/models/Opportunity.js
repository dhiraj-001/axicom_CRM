const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  opportunityName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Opportunity Amount must be greater than 0']
  },
  stage: {
    type: String,
    required: true,
    enum: ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    default: 'Qualification'
  },
  probability: {
    type: Number,
    required: true,
    min: [0, 'Probability must be between 0 and 100'],
    max: [100, 'Probability must be between 0 and 100'],
    default: 20
  },
  expectedCloseDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Won', 'Lost'],
    default: 'Open'
  },
  source: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

opportunitySchema.virtual('weightedAmount').get(function () {
  return (this.amount * this.probability) / 100;
});

module.exports = mongoose.model('Opportunity', opportunitySchema);

