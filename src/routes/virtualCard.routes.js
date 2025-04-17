const express = require('express');
const { createVirtualCard, getVirtualCards, toggleCardStatus } = require('../controllers/virtualCard.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createVirtualCard);
router.get('/', getVirtualCards);
router.patch('/:cardId/toggle', toggleCardStatus);

module.exports = router;