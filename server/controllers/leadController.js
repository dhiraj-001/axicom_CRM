const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const { logAudit } = require('../middleware/audit');

const getLeadScope = (user) => {
  if (user.role === 'Admin' || user.role === 'Manager') {
    return {};
  }
  return { assignedTo: user._id };
};

exports.getLeads = async (req, res) => {
  try {
    const { search, status, source, priority, page = 1, limit = 10 } = req.query;
    const filter = { ...getLeadScope(req.user) };

    if (search) {
      filter.$or = [
        { leadName: { $regex: search, $options: 'i' } },
        { leadCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (priority) filter.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .populate('convertedCustomer', 'customerName customerCode')
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: leads,
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

exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('convertedCustomer', 'customerName customerCode');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    if (req.user.role === 'SalesExecutive' && lead.assignedTo && lead.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this lead.' });
    }

    const followUps = await FollowUp.find({ lead: lead._id }).populate('assignedTo', 'name').sort({ followUpDate: -1 });
    const activities = await Activity.find({ lead: lead._id }).populate('assignedTo', 'name').sort({ activityDate: -1 });

    res.json({
      success: true,
      data: {
        lead,
        followUps,
        activities
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const { leadName, email, phone, companyName, source, status, priority, expectedValue, notes, assignedTo } = req.body;

    if (!leadName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Lead name, email, and phone are required.' });
    }

    const count = await Lead.countDocuments();
    const leadCode = `LEAD-${2001 + count}`;

    const assignedUserId = assignedTo || req.user._id;

    const lead = await Lead.create({
      leadCode,
      leadName: leadName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      companyName: companyName ? companyName.trim() : '',
      source: source || 'Website',
      status: status || 'New',
      priority: priority || 'Medium',
      expectedValue: Number(expectedValue) || 0,
      notes: notes ? notes.trim() : '',
      assignedTo: assignedUserId
    });

    await logAudit(req, 'Create', 'Lead', lead._id, null, `Created lead: ${lead.leadName} (${lead.leadCode})`);

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    if (req.user.role === 'SalesExecutive' && lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this lead.' });
    }

    const oldState = { name: lead.leadName, status: lead.status };

    const fields = ['leadName', 'email', 'phone', 'companyName', 'source', 'status', 'priority', 'expectedValue', 'notes', 'assignedTo'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) lead[f] = req.body[f];
    });

    await lead.save();

    await logAudit(req, 'Update', 'Lead', lead._id, oldState, { name: lead.leadName, status: lead.status });

    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    if (lead.status === 'Converted') {
      return res.status(400).json({ success: false, message: 'Lead has already been converted.' });
    }

    const { customerName, createOpportunity, opportunityName, opportunityAmount, stage, probability, expectedCloseDate } = req.body;

    let customer = await Customer.findOne({
      $or: [{ email: lead.email }, { phone: lead.phone }]
    });

    if (!customer) {
      const custCount = await Customer.countDocuments();
      customer = await Customer.create({
        customerCode: `CUST-${1001 + custCount}`,
        customerName: customerName || lead.companyName || lead.leadName,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName || '',
        status: 'Active',
        createdBy: req.user._id
      });
    }

    let opportunity = null;
    if (createOpportunity) {
      const amount = Number(opportunityAmount) || lead.expectedValue || 50000;
      if (amount <= 0) {
        return res.status(400).json({ success: false, message: 'Opportunity Amount must be greater than 0.' });
      }

      opportunity = await Opportunity.create({
        opportunityName: opportunityName || `${lead.leadName} Deal`,
        customer: customer._id,
        lead: lead._id,
        amount,
        stage: stage || 'Qualification',
        probability: probability !== undefined ? Number(probability) : 30,
        expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Open',
        source: lead.source,
        notes: `Converted from Lead: ${lead.leadName}`,
        assignedTo: lead.assignedTo || req.user._id
      });
    }

    lead.status = 'Converted';
    lead.convertedCustomer = customer._id;
    lead.convertedOpportunity = opportunity ? opportunity._id : null;
    await lead.save();

    await logAudit(
      req,
      'Lead Conversion',
      'Lead',
      lead._id,
      'Status: Open',
      `Converted to Customer #${customer._id} ${opportunity ? `and Deal #${opportunity._id}` : ''}`
    );

    res.json({
      success: true,
      message: `Lead converted successfully to Customer '${customer.customerName}'!`,
      data: {
        customer,
        opportunity
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    if (req.user.role === 'SalesExecutive' && lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this lead.' });
    }

    const name = lead.leadName;
    await Lead.findByIdAndDelete(req.params.id);

    await logAudit(req, 'Delete', 'Lead', req.params.id, { name }, null);

    res.json({ success: true, message: `Lead '${name}' deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

