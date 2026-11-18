const Opportunity = require('../models/Opportunity');
const Customer = require('../models/Customer');
const FollowUp = require('../models/FollowUp');
const { logAudit } = require('../middleware/audit');

const getOppScope = (user) => {
  if (user.role === 'Admin' || user.role === 'Manager') {
    return {};
  }
  return { assignedTo: user._id };
};

exports.getOpportunities = async (req, res) => {
  try {
    const { search, stage, status, page = 1, limit = 10 } = req.query;
    const filter = { ...getOppScope(req.user) };

    if (search) {
      filter.opportunityName = { $regex: search, $options: 'i' };
    }

    if (stage) filter.stage = stage;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Opportunity.countDocuments(filter);
    const opportunities = await Opportunity.find(filter)
      .populate('customer', 'customerName customerCode')
      .populate('assignedTo', 'name email')
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: opportunities,
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

exports.getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('customer', 'customerName customerCode email phone')
      .populate('assignedTo', 'name email');

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    if (req.user.role === 'SalesExecutive' && opportunity.assignedTo && opportunity.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this opportunity.' });
    }

    const followUps = await FollowUp.find({ opportunity: opportunity._id }).populate('assignedTo', 'name').sort({ followUpDate: -1 });

    res.json({
      success: true,
      data: {
        opportunity,
        followUps
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createOpportunity = async (req, res) => {
  try {
    const { opportunityName, customer, lead, amount, stage, probability, expectedCloseDate, source, notes, assignedTo } = req.body;

    if (!opportunityName || !customer || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Name, customer, and amount are required.' });
    }

    const numAmount = Number(amount);
    if (numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Opportunity Amount must be greater than 0.' });
    }

    const numProb = Number(probability ?? 20);
    if (numProb < 0 || numProb > 100) {
      return res.status(400).json({ success: false, message: 'Probability must be between 0 and 100.' });
    }

    const closeDate = new Date(expectedCloseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (stage !== 'Won' && stage !== 'Lost' && closeDate < today) {
      return res.status(400).json({ success: false, message: 'Expected Close Date cannot be in the past.' });
    }

    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(404).json({ success: false, message: 'Referenced customer does not exist.' });
    }

    const status = stage === 'Won' ? 'Won' : stage === 'Lost' ? 'Lost' : 'Open';

    const opp = await Opportunity.create({
      opportunityName: opportunityName.trim(),
      customer,
      lead: lead || null,
      amount: numAmount,
      stage: stage || 'Qualification',
      probability: numProb,
      expectedCloseDate: closeDate,
      status,
      source: source || '',
      notes: notes || '',
      assignedTo: assignedTo || req.user._id
    });

    await logAudit(req, 'Create', 'Opportunity', opp._id, null, `Created opportunity: ${opp.opportunityName} (Rs. ${opp.amount})`);

    res.status(201).json({ success: true, data: opp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    if (req.user.role === 'SalesExecutive' && opp.assignedTo && opp.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this opportunity.' });
    }

    const { opportunityName, amount, stage, probability, expectedCloseDate, source, notes, assignedTo } = req.body;

    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'Opportunity Amount must be greater than 0.' });
      }
      opp.amount = Number(amount);
    }

    if (probability !== undefined) {
      if (Number(probability) < 0 || Number(probability) > 100) {
        return res.status(400).json({ success: false, message: 'Probability must be between 0 and 100.' });
      }
      opp.probability = Number(probability);
    }

    if (expectedCloseDate) {
      const closeDate = new Date(expectedCloseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (stage !== 'Won' && stage !== 'Lost' && closeDate < today) {
        return res.status(400).json({ success: false, message: 'Expected Close Date cannot be in the past.' });
      }
      opp.expectedCloseDate = closeDate;
    }

    const oldState = { name: opp.opportunityName, stage: opp.stage, amount: opp.amount };

    if (opportunityName) opp.opportunityName = opportunityName.trim();
    if (stage) {
      opp.stage = stage;
      opp.status = stage === 'Won' ? 'Won' : stage === 'Lost' ? 'Lost' : 'Open';
    }
    if (source !== undefined) opp.source = source;
    if (notes !== undefined) opp.notes = notes;
    if (assignedTo) opp.assignedTo = assignedTo;

    await opp.save();

    await logAudit(req, 'Update', 'Opportunity', opp._id, oldState, { name: opp.opportunityName, stage: opp.stage, amount: opp.amount });

    res.json({ success: true, data: opp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    if (req.user.role === 'SalesExecutive' && opp.assignedTo && opp.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this opportunity.' });
    }

    const name = opp.opportunityName;
    await Opportunity.findByIdAndDelete(req.params.id);

    await logAudit(req, 'Delete', 'Opportunity', req.params.id, { name }, null);

    res.json({ success: true, message: `Opportunity '${name}' deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

