require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const AuditLog = require('../models/AuditLog');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/acxiom_crm';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for database seeding...');

    await User.deleteMany({});
    await Customer.deleteMany({});
    await Lead.deleteMany({});
    await Opportunity.deleteMany({});
    await FollowUp.deleteMany({});
    await Activity.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Cleared existing collections.');

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@acxiomcrm.com',
      password: 'Admin@123',
      role: 'Admin',
      isActive: true
    });

    const manager = await User.create({
      name: 'Vikram Malhotra',
      email: 'manager@acxiomcrm.com',
      password: 'Manager@123',
      role: 'Manager',
      isActive: true
    });

    const sales1 = await User.create({
      name: 'Rahul Sharma',
      email: 'sales@acxiomcrm.com',
      password: 'Sales@123',
      role: 'SalesExecutive',
      isActive: true
    });

    const sales2 = await User.create({
      name: 'Priya Patel',
      email: 'sales2@acxiomcrm.com',
      password: 'Sales@123',
      role: 'SalesExecutive',
      isActive: true
    });

    console.log('Users seeded.');

    const cust1 = await Customer.create({
      customerCode: 'CUST-1001',
      customerName: 'Apex Global Technologies',
      email: 'contact@apextech.in',
      phone: '9820123456',
      companyName: 'Apex Global Ltd',
      address: 'Cyber City, DLF Phase 2',
      city: 'Gurugram',
      state: 'Haryana',
      status: 'Active',
      createdBy: sales1._id,
      createdDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    });

    const cust2 = await Customer.create({
      customerCode: 'CUST-1002',
      customerName: 'BlueHorizon Retail',
      email: 'procure@bluehorizon.co.in',
      phone: '9811234567',
      companyName: 'BlueHorizon Retailers Pvt Ltd',
      address: 'MG Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      status: 'Active',
      createdBy: sales1._id,
      createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    });

    const cust3 = await Customer.create({
      customerCode: 'CUST-1003',
      customerName: 'Zenith Healthcare Solutions',
      email: 'info@zenithhealth.org',
      phone: '9833445566',
      companyName: 'Zenith Healthcare',
      address: 'BKC Complex, Bandra East',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'Active',
      createdBy: sales2._id,
      createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    });

    console.log('Customers seeded.');

    const lead1 = await Lead.create({
      leadCode: 'LEAD-2001',
      leadName: 'Arun Verma',
      email: 'arun.verma@quantumfin.com',
      phone: '9711998877',
      companyName: 'Quantum Financial Advisory',
      source: 'Website',
      status: 'Qualified',
      priority: 'High',
      expectedValue: 450000,
      notes: 'Interested in full ERP and CRM integration package.',
      assignedTo: sales1._id,
      createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    });

    const lead2 = await Lead.create({
      leadCode: 'LEAD-2002',
      leadName: 'Neha Saxena',
      email: 'neha@innovatehub.in',
      phone: '9988776655',
      companyName: 'Innovate Hub',
      source: 'Referral',
      status: 'Contacted',
      priority: 'Medium',
      expectedValue: 280000,
      notes: 'Initial product demo requested for next week.',
      assignedTo: sales1._id,
      createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    });

    const lead3 = await Lead.create({
      leadCode: 'LEAD-2003',
      leadName: 'Kunal Mehra',
      email: 'kunal@mehraholdings.com',
      phone: '9876543210',
      companyName: 'Mehra Holdings',
      source: 'Cold Call',
      status: 'New',
      priority: 'Low',
      expectedValue: 150000,
      notes: 'Introduction email sent.',
      assignedTo: sales2._id,
      createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });

    console.log('Leads seeded.');

    const opp1 = await Opportunity.create({
      opportunityName: 'Apex Cloud Migration 2026',
      customer: cust1._id,
      amount: 650000,
      stage: 'Negotiation',
      probability: 80,
      expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'Open',
      source: 'Existing Customer',
      notes: 'Commercial proposal under legal review.',
      assignedTo: sales1._id,
      createdDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    });

    const opp2 = await Opportunity.create({
      opportunityName: 'BlueHorizon POS Expansion',
      customer: cust2._id,
      amount: 350000,
      stage: 'Proposal',
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      status: 'Open',
      source: 'Website',
      notes: 'Scope document presented.',
      assignedTo: sales1._id,
      createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    });

    const opp3 = await Opportunity.create({
      opportunityName: 'Zenith Hospital Management Suite',
      customer: cust3._id,
      amount: 1200000,
      stage: 'Qualification',
      probability: 30,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'Open',
      source: 'Referral',
      notes: 'RFP preparation in progress.',
      assignedTo: sales2._id,
      createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    const opp4 = await Opportunity.create({
      opportunityName: 'Apex Annual Maintenance Renewal',
      customer: cust1._id,
      amount: 250000,
      stage: 'Won',
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'Won',
      source: 'Direct Renewal',
      notes: 'PO received and contract executed.',
      assignedTo: sales1._id,
      createdDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
    });

    console.log('Opportunities seeded.');

    await FollowUp.create({
      customer: cust1._id,
      opportunity: opp1._id,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      followUpType: 'Meeting',
      subject: 'Final Contract Terms Review',
      remarks: 'Meet CFO at Gurugram office for SLA sign-off.',
      status: 'Planned',
      assignedTo: sales1._id
    });

    await FollowUp.create({
      lead: lead1._id,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      followUpType: 'Call',
      subject: 'Requirement Discussion Call',
      remarks: 'Walk through architectural points with technical lead.',
      status: 'Planned',
      assignedTo: sales1._id
    });

    console.log('Follow-ups seeded.');

    await Activity.create({
      activityType: 'Meeting',
      subject: 'Initial Solution Architecture Workshop',
      description: 'Discussed cloud scaling, database replication and security.',
      activityDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      customer: cust1._id,
      assignedTo: sales1._id,
      status: 'Completed'
    });

    await AuditLog.create({
      user: admin._id,
      userName: admin.email,
      action: 'System Initialization',
      entityName: 'Database',
      recordId: 'SYSTEM',
      oldValue: null,
      newValue: 'Cloud MongoDB database initialized with core users, roles, and CRM test data.',
      result: 'Success',
      ipAddress: '127.0.0.1'
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDatabase();

