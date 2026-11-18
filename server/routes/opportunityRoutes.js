const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getOpportunities)
  .post(createOpportunity);

router.route('/:id')
  .get(getOpportunity)
  .put(updateOpportunity)
  .delete(deleteOpportunity);

module.exports = router;

