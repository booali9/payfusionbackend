const express = require('express');
const { checkInvestmentEligibility } = require('../controllers/investment.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/eligibility', checkInvestmentEligibility);

module.exports = router;