const express = require('express');
const kycController = require('../controllers/kyc.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadKYCDocs } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/submit', uploadKYCDocs, kycController.submitKYC);
router.get('/status', kycController.getKYCStatus);
router.post('/review', authorize('admin'), kycController.reviewKYC);

module.exports = router;