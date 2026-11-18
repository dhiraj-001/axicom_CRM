const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAudit } = require('../middleware/audit');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_acxiom_crm_2026_secure', {
    expiresIn: '8h'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email address already registered.' });
    }

    const assignedRole = ['Admin', 'Manager', 'SalesExecutive'].includes(role) ? role : 'SalesExecutive';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole
    });

    const token = generateToken(user._id);

    await logAudit(req, 'Register', 'Auth', user._id, null, `Registered with role: ${user.role}`);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      await logAudit(req, 'Failed Login', 'Auth', null, null, `Email not found: ${email}`, 'Failed');
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      await logAudit(req, 'Failed Login', 'Auth', user._id, null, 'Account deactivated', 'Failed');
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact administrator.' });
    }

    if (user.isLocked()) {
      await logAudit(req, 'Lockout Block', 'Auth', user._id, null, 'Attempt during lockout', 'Security Alert');
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to repeated failed login attempts. Try again later.'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.handleFailedLogin();
      await logAudit(req, 'Failed Login', 'Auth', user._id, null, `Invalid attempt (count: ${user.failedLoginCount})`, 'Failed');
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await user.resetFailedLogin();
    const token = generateToken(user._id);

    await logAudit(req, 'Login', 'Auth', user._id, null, 'User logged in successfully');

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = async (req, res) => {
  if (req.user) {
    await logAudit(req, 'Logout', 'Auth', req.user._id, null, 'User logged out');
  }
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
};

