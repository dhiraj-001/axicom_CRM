const User = require('../models/User');
const { logAudit } = require('../middleware/audit');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'SalesExecutive',
      isActive: isActive !== undefined ? isActive : true
    });

    await logAudit(req, 'User Creation', 'User', user._id, null, `Created user: ${user.email} with role: ${user.role}`);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldState = { role: user.role, isActive: user.isActive, name: user.name };
    const { name, role, isActive } = req.body;

    if (name) user.name = name.trim();
    if (role && ['Admin', 'Manager', 'SalesExecutive'].includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    await logAudit(req, 'User Update', 'User', user._id, oldState, { role: user.role, isActive: user.isActive, name: user.name });

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleLock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isLocked()) {
      user.lockoutEnd = null;
      user.failedLoginCount = 0;
      await user.save();
      await logAudit(req, 'Account Unlock', 'Security', user._id, 'Locked', 'Unlocked');
      return res.json({ success: true, message: `Account for ${user.email} unlocked.` });
    } else {
      user.lockoutEnd = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
      await user.save();
      await logAudit(req, 'Account Lockout', 'Security', user._id, 'Unlocked', 'Admin Locked');
      return res.json({ success: true, message: `Account for ${user.email} locked.` });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    await logAudit(req, 'Password Reset', 'Security', user._id, null, `Password reset by Admin for ${user.email}`);

    res.json({ success: true, message: `Password for ${user.email} updated successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

