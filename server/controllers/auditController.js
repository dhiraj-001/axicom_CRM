const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const { user, module, action, fromDate, toDate, page = 1, limit = 15 } = req.query;
    const filter = {};

    if (user) {
      filter.$or = [
        { userName: { $regex: user, $options: 'i' } },
        { recordId: { $regex: user, $options: 'i' } }
      ];
    }

    if (module) filter.entityName = module;
    if (action) filter.action = action;

    if (fromDate || toDate) {
      filter.createdDate = {};
      if (fromDate) filter.createdDate.$gte = new Date(fromDate);
      if (toDate) {
        const toD = new Date(toDate);
        toD.setHours(23, 59, 59, 999);
        filter.createdDate.$lte = toD;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const modules = await AuditLog.distinct('entityName');
    const actions = await AuditLog.distinct('action');

    res.json({
      success: true,
      data: logs,
      filters: { modules, actions },
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

