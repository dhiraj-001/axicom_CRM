const Activity = require('../models/Activity');
const { logAudit } = require('../middleware/audit');

const getActivityScope = (user) => {
  if (user.role === 'Admin' || user.role === 'Manager') {
    return {};
  }
  return { assignedTo: user._id };
};

exports.getActivities = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const filter = { ...getActivityScope(req.user) };

    if (type) filter.activityType = type;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Activity.countDocuments(filter);
    const activities = await Activity.find(filter)
      .populate('customer', 'customerName')
      .populate('lead', 'leadName')
      .populate('assignedTo', 'name email')
      .sort({ activityDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: activities,
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

exports.createActivity = async (req, res) => {
  try {
    const { activityType, subject, description, activityDate, customer, lead, assignedTo, status } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, message: 'Activity subject is required.' });
    }

    const activity = await Activity.create({
      activityType: activityType || 'Call',
      subject: subject.trim(),
      description: description ? description.trim() : '',
      activityDate: activityDate || new Date(),
      customer: customer || null,
      lead: lead || null,
      assignedTo: assignedTo || req.user._id,
      status: status || 'Completed'
    });

    await logAudit(req, 'Create', 'Activity', activity._id, null, `Logged ${activity.activityType}: ${activity.subject}`);

    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

