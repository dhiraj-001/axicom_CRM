const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, entityName, recordId, oldValue, newValue, result = 'Success') => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      userName: req.user ? req.user.email : req.body?.email || 'Anonymous',
      action,
      entityName,
      recordId: recordId ? recordId.toString() : null,
      oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue,
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : newValue,
      result,
      ipAddress: ip
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

module.exports = { logAudit };

