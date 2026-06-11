const User = require('../models/User');

// Ensure the user has an active subscription or valid trial
const ensureSubscriptionActive = async (req, res, next) => {
  try {
    // `protect` middleware should have attached req.user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user._id).select('plan planExpiry');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const now = new Date();

    if (!user.plan || user.plan === 'none') {
      return res.status(403).json({ message: 'No active subscription. Please select a plan.' });
    }

    if (!user.planExpiry || user.planExpiry <= now) {
      return res.status(403).json({ message: 'Subscription expired. Please renew.' });
    }

    // Active
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to verify subscription' });
  }
};

module.exports = { ensureSubscriptionActive };
