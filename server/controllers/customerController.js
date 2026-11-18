const Customer = require('../models/Customer');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const { logAudit } = require('../middleware/audit');

const getCustomerScope = (user) => {
  if (user.role === 'Admin' || user.role === 'Manager') {
    return {};
  }
  return { createdBy: user._id };
};

exports.getCustomers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const filter = { ...getCustomerScope(req.user) };

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: customers,
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

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('createdBy', 'name email');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (req.user.role === 'SalesExecutive' && customer.createdBy && customer.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this customer.' });
    }

    const opportunities = await Opportunity.find({ customer: customer._id }).sort({ createdDate: -1 });
    const followUps = await FollowUp.find({ customer: customer._id }).populate('assignedTo', 'name').sort({ followUpDate: -1 });
    const activities = await Activity.find({ customer: customer._id }).populate('assignedTo', 'name').sort({ activityDate: -1 });

    res.json({
      success: true,
      data: {
        customer,
        opportunities,
        followUps,
        activities
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { customerName, email, phone, companyName, address, city, state, status } = req.body;

    if (!customerName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required.' });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number starting with 6-9.' });
    }

    const emailExists = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(409).json({ success: false, message: 'A customer with this email already exists.' });
    }

    const phoneExists = await Customer.findOne({ phone: phone.trim() });
    if (phoneExists) {
      return res.status(409).json({ success: false, message: 'A customer with this phone number already exists.' });
    }

    const count = await Customer.countDocuments();
    const customerCode = `CUST-${1001 + count}`;

    const customer = await Customer.create({
      customerCode,
      customerName: customerName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      companyName: companyName ? companyName.trim() : '',
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
      state: state ? state.trim() : '',
      status: status || 'Active',
      createdBy: req.user._id
    });

    await logAudit(req, 'Create', 'Customer', customer._id, null, `Created customer: ${customer.customerName} (${customer.customerCode})`);

    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (req.user.role === 'SalesExecutive' && customer.createdBy && customer.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this customer.' });
    }

    const { customerName, email, phone, companyName, address, city, state, status } = req.body;

    if (phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number starting with 6-9.' });
      }
      const phoneExists = await Customer.findOne({ phone: phone.trim(), _id: { $ne: customer._id } });
      if (phoneExists) {
        return res.status(409).json({ success: false, message: 'Another customer with this phone number exists.' });
      }
      customer.phone = phone.trim();
    }

    if (email) {
      const emailExists = await Customer.findOne({ email: email.toLowerCase().trim(), _id: { $ne: customer._id } });
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Another customer with this email exists.' });
      }
      customer.email = email.toLowerCase().trim();
    }

    const oldSnapshot = { name: customer.customerName, status: customer.status };

    if (customerName) customer.customerName = customerName.trim();
    if (companyName !== undefined) customer.companyName = companyName.trim();
    if (address !== undefined) customer.address = address.trim();
    if (city !== undefined) customer.city = city.trim();
    if (state !== undefined) customer.state = state.trim();
    if (status) customer.status = status;
    customer.modifiedDate = new Date();

    await customer.save();

    await logAudit(req, 'Update', 'Customer', customer._id, oldSnapshot, { name: customer.customerName, status: customer.status });

    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (req.user.role === 'SalesExecutive' && customer.createdBy && customer.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this customer.' });
    }

    const name = customer.customerName;
    await Customer.findByIdAndDelete(req.params.id);

    await logAudit(req, 'Delete', 'Customer', req.params.id, { name }, null);

    res.json({ success: true, message: `Customer '${name}' deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

