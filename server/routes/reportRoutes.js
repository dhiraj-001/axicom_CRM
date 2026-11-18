const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getPipelineReport,
  getConversionReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/pipeline', getPipelineReport);
router.get('/conversion', getConversionReport);

module.exports = router;

