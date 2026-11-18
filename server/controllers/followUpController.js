const FollowUp = require('../models/FollowUp');
const { logAudit } = require('../middleware/audit');

const getFollowUpScope = (user) => {
  if (user.role === 'Admin' || user.role === 'Manager') {
    return {};
  }
  return { assignedTo: user._id };
};

exports.getFollowUps = async (req, res) => {
  try {
    const { filter, type, status, page = 1, limit = 10 } = req.query;
    const query = { ...getFollowUpScope(req.user) };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') {
      query.status = 'Planned';
      query.followUpDate = { $gte: today };
    } else if (filter === 'overdue') {
      query.status = 'Planned';
      query.followUpDate = { $lt: today };
    } else if (filter === 'completed') {
      query.status = 'Completed';
    }

    if (type) query.followUpType = type;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await FollowUp.countDocuments(query);
    const followUps = await FollowUp.find(query)
      .populate('customer', 'customerName customerCode')
      .populate('lead', 'leadName leadCode')
      .populate('opportunity', 'opportunityName amount')
      .populate('assignedTo', 'name email')
      .sort({ followUpDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: followUps,
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

exports.createFollowUp = async (req, res) => {
  try {
    const { customer, lead, opportunity, followUpDate, followUpType, subject, remarks, status, assignedTo } = req.body;

    if (!subject || !followUpDate) {
      return res.status(400).json({ success: false, message: 'Subject and follow-up date are required.' });
    }

    const fDate = new Date(followUpDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if ((status === 'Planned' || !status) && fDate < today) {
      return res.status(400).json({ success: false, message: 'Follow-up date cannot be earlier than today.' });
    }

    const followUp = await FollowUp.create({
      customer: customer || null,
      lead: lead || null,
      opportunity: opportunity || null,
      followUpDate: fDate,
      followUpType: followUpType || 'Call',
      subject: subject.trim(),
      remarks: remarks ? remarks.trim() : '',
      status: status || 'Planned',
      assignedTo: assignedTo || req.user._id
    });

    await logAudit(req, 'Create', 'FollowUp', followUp._id, null, `Scheduled follow-up: ${followUp.subject}`);

    res.status(201).json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found.' });
    }

    if (req.user.role === 'SalesExecutive' && followUp.assignedTo && followUp.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this follow-up.' });
    }

    const oldState = { status: followUp.status, date: followUp.followUpDate };

    const fields = ['customer', 'lead', 'opportunity', 'followUpDate', 'followUpType', 'subject', 'remarks', 'status', 'assignedTo'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) followUp[f] = req.body[f];
    });

    await followUp.save();

    await logAudit(req, 'Update', 'FollowUp', followUp._id, oldState, { status: followUp.status, date: followUp.followUpDate });

    res.json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found.' });
    }

    if (req.user.role === 'SalesExecutive' && followUp.assignedTo && followUp.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this follow-up.' });
    }

    followUp.status = 'Completed';
    if (req.body.remarks) {
      followUp.remarks = followUp.remarks ? `${followUp.remarks} | Outcome: ${req.body.remarks}` : req.body.remarks;
    }
    await followUp.save();

    await logAudit(req, 'Complete', 'FollowUp', followUp._id, 'Planned', 'Completed');

    res.json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

