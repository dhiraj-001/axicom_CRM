const express = require('express');
const router = express.Router();
const {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  completeFollowUp
} = require('../controllers/followUpController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getFollowUps)
  .post(createFollowUp);

router.route('/:id')
  .put(updateFollowUp);

router.post('/:id/complete', completeFollowUp);

module.exports = router;

