const express = require('express');
const { submitKYC, getKYCStatus } = require('../controllers/kyc.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadKYCDocs } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/submit', uploadKYCDocs, submitKYC);
router.get('/status', getKYCStatus);

module.exports = router;