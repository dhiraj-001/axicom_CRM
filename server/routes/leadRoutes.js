const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  convertLead,
  deleteLead
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(deleteLead);

router.post('/:id/convert', convertLead);

module.exports = router;

