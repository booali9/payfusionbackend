const express = require('express');
const { createTransaction, getTransactions, getTransactionDetails } = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionDetails);

module.exports = router;