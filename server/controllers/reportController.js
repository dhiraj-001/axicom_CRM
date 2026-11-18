const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const User = require('../models/User');

const getReportScope = (user) => {
  if (user.role === 'Admin' || user.role === 'Manager') {
    return {
      custFilter: {},
      leadFilter: {},
      oppFilter: {},
      followFilter: {}
    };
  }
  return {
    custFilter: { createdBy: user._id },
    leadFilter: { assignedTo: user._id },
    oppFilter: { assignedTo: user._id },
    followFilter: { assignedTo: user._id }
  };
};

exports.getDashboard = async (req, res) => {
  try {
    const { dateFilter = 'all', fromDate, toDate } = req.query;
    const { custFilter, leadFilter, oppFilter, followFilter } = getReportScope(req.user);

    let start = null;
    let end = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      start = new Date(today);
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
    } else if (dateFilter === 'week') {
      const dayOfWeek = today.getDay();
      start = new Date(today);
      start.setDate(today.getDate() - dayOfWeek);
      end = new Date(start);
      end.setDate(start.getDate() + 7);
      end.setHours(23, 59, 59, 999);
    } else if (dateFilter === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (dateFilter === 'custom') {
      if (fromDate) start = new Date(fromDate);
      if (toDate) {
        end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
      }
    }

    if (start) {
      custFilter.createdDate = custFilter.createdDate || {};
      custFilter.createdDate.$gte = start;
      leadFilter.createdDate = leadFilter.createdDate || {};
      leadFilter.createdDate.$gte = start;
      oppFilter.createdDate = oppFilter.createdDate || {};
      oppFilter.createdDate.$gte = start;
    }

    if (end) {
      custFilter.createdDate = custFilter.createdDate || {};
      custFilter.createdDate.$lte = end;
      leadFilter.createdDate = leadFilter.createdDate || {};
      leadFilter.createdDate.$lte = end;
      oppFilter.createdDate = oppFilter.createdDate || {};
      oppFilter.createdDate.$lte = end;
    }

    const totalCustomers = await Customer.countDocuments(custFilter);
    const totalLeads = await Lead.countDocuments(leadFilter);
    const openLeads = await Lead.countDocuments({
      ...leadFilter,
      status: { $nin: ['Converted', 'Lost', 'Unqualified'] }
    });

    const totalOpportunities = await Opportunity.countDocuments(oppFilter);
    const openOpportunities = await Opportunity.countDocuments({
      ...oppFilter,
      stage: { $nin: ['Won', 'Lost'] }
    });
    const wonOpportunities = await Opportunity.countDocuments({ ...oppFilter, stage: 'Won' });
    const lostOpportunities = await Opportunity.countDocuments({ ...oppFilter, stage: 'Lost' });

    const openOpps = await Opportunity.find({ ...oppFilter, stage: { $nin: ['Won', 'Lost'] } });
    const totalPipelineValue = openOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
    const weightedPipelineValue = openOpps.reduce((sum, o) => sum + ((o.amount || 0) * (o.probability || 0)) / 100, 0);

    const pendingFollowUps = await FollowUp.countDocuments({ ...followFilter, status: 'Planned' });
    const overdueFollowUps = await FollowUp.countDocuments({
      ...followFilter,
      status: 'Planned',
      followUpDate: { $lt: today }
    });

    const leadStatuses = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];
    const leadStatusCounts = [];
    for (const st of leadStatuses) {
      const c = await Lead.countDocuments({ ...leadFilter, status: st });
      leadStatusCounts.push(c);
    }

    const pipelineStages = ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    const allOppsForStages = await Opportunity.find(oppFilter);
    const pipelineStageAmounts = pipelineStages.map(stage => {
      return allOppsForStages
        .filter(o => o.stage === stage)
        .reduce((sum, o) => sum + (o.amount || 0), 0);
    });

    const monthlyLabels = [];
    const monthlySalesValues = [];
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mEnd = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthName = mDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyLabels.push(monthName);

      const wonThisMonth = allOppsForStages.filter(o => o.stage === 'Won' && o.createdDate >= mDate && o.createdDate <= mEnd);
      const totalMonth = wonThisMonth.reduce((acc, o) => acc + (o.amount || 0), 0);
      monthlySalesValues.push(totalMonth);
    }

    const upcomingFollowUps = await FollowUp.find({ ...followFilter, status: 'Planned' })
      .populate('customer', 'customerName')
      .populate('lead', 'leadName')
      .sort({ followUpDate: 1 })
      .limit(5);

    const recentOpportunities = await Opportunity.find(oppFilter)
      .populate('customer', 'customerName')
      .sort({ createdDate: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalLeads,
        openLeads,
        totalOpportunities,
        openOpportunities,
        wonOpportunities,
        lostOpportunities,
        totalPipelineValue,
        weightedPipelineValue,
        pendingFollowUps,
        overdueFollowUps,
        leadStatusLabels: leadStatuses,
        leadStatusCounts,
        pipelineStageLabels: pipelineStages,
        pipelineStageAmounts,
        monthlySalesLabels: monthlyLabels,
        monthlySalesValues,
        upcomingFollowUps,
        recentOpportunities
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPipelineReport = async (req, res) => {
  try {
    const { oppFilter } = getReportScope(req.user);
    const opportunities = await Opportunity.find(oppFilter)
      .populate('customer', 'customerName')
      .populate('assignedTo', 'name');

    const stages = ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    const stageReport = stages.map(stage => {
      const opps = opportunities.filter(o => o.stage === stage);
      const total = opps.reduce((sum, o) => sum + (o.amount || 0), 0);
      const weighted = opps.reduce((sum, o) => sum + ((o.amount || 0) * (o.probability || 0)) / 100, 0);
      return {
        stage,
        count: opps.length,
        totalAmount: total,
        weightedAmount: weighted
      };
    });

    const ownerMap = {};
    opportunities.forEach(o => {
      const name = o.assignedTo ? o.assignedTo.name : 'Unassigned';
      if (!ownerMap[name]) {
        ownerMap[name] = { count: 0, totalAmount: 0, weightedAmount: 0 };
      }
      ownerMap[name].count += 1;
      ownerMap[name].totalAmount += (o.amount || 0);
      ownerMap[name].weightedAmount += ((o.amount || 0) * (o.probability || 0)) / 100;
    });

    const ownerReport = Object.keys(ownerMap).map(name => ({
      ownerName: name,
      ...ownerMap[name]
    }));

    if (req.query.format === 'csv') {
      let csv = 'Stage,Count,Total Amount,Weighted Amount\n';
      stageReport.forEach(r => {
        csv += `"${r.stage}",${r.count},${r.totalAmount},${r.weightedAmount}\n`;
      });
      csv += '\nOwner,Opportunity Count,Total Amount,Weighted Amount\n';
      ownerReport.forEach(r => {
        csv += `"${r.ownerName}",${r.count},${r.totalAmount},${r.weightedAmount}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="pipeline_report.csv"');
      return res.send(csv);
    }

    res.json({
      success: true,
      data: {
        stageReport,
        ownerReport
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getConversionReport = async (req, res) => {
  try {
    const { leadFilter } = getReportScope(req.user);
    const leads = await Lead.find(leadFilter);

    const sourceMap = {};
    leads.forEach(l => {
      const src = l.source || 'Other';
      if (!sourceMap[src]) {
        sourceMap[src] = { total: 0, converted: 0, lost: 0 };
      }
      sourceMap[src].total += 1;
      if (l.status === 'Converted') sourceMap[src].converted += 1;
      if (l.status === 'Lost' || l.status === 'Unqualified') sourceMap[src].lost += 1;
    });

    const report = Object.keys(sourceMap).map(src => {
      const d = sourceMap[src];
      const rate = d.total > 0 ? Math.round((d.converted / d.total) * 1000) / 10 : 0;
      return {
        source: src,
        totalLeads: d.total,
        convertedCount: d.converted,
        lostCount: d.lost,
        conversionRate: rate
      };
    });

    if (req.query.format === 'csv') {
      let csv = 'Lead Source,Total Leads,Converted,Lost/Unqualified,Conversion Rate (%)\n';
      report.forEach(r => {
        csv += `"${r.source}",${r.totalLeads},${r.convertedCount},${r.lostCount},${r.conversionRate}%\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="conversion_report.csv"');
      return res.send(csv);
    }

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

