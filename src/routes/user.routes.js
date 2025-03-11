const express = require('express');
const { getUserProfile, updateUserProfile, completeOnboarding } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/complete-onboarding', completeOnboarding);

module.exports = router;