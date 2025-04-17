const express = require('express');
const { receiveMoneyRequest, processReceivedMoney } = require('../controllers/moneyReceive.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.post('/request', receiveMoneyRequest);
router.post('/process/:reference', processReceivedMoney);

module.exports = router;