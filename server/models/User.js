const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
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
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'SalesExecutive'],
    default: 'SalesExecutive'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  failedLoginCount: {
    type: Number,
    default: 0
  },
  lockoutEnd: {
    type: Date,
    default: null
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockoutEnd && this.lockoutEnd > new Date();
};

userSchema.methods.handleFailedLogin = async function () {
  this.failedLoginCount += 1;
  if (this.failedLoginCount >= 5) {
    this.lockoutEnd = new Date(Date.now() + 15 * 60 * 1000);
  }
  return this.save();
};

userSchema.methods.resetFailedLogin = async function () {
  this.failedLoginCount = 0;
  this.lockoutEnd = null;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);

