const express = require('express');
const router = express.Router();
const { createCheckoutSession, confirmCheckout } = require('../controllers/paymentsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-session', protect, createCheckoutSession);
router.post('/confirm', protect, confirmCheckout);

module.exports = router;
