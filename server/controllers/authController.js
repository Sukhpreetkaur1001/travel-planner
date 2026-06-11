const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendMail = require('../services/mailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'This email is already registered. Please login instead.' });
    }

    // Create user without automatic trial; user will choose a plan explicitly
    const user = await User.create({
      name,
      email,
      password,
      plan: 'none',
      planStart: null,
      planExpiry: null,
      trialUsed: false
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        planStart: user.planStart,
        planExpiry: user.planExpiry,
        trialUsed: user.trialUsed,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0]?.message || 'Invalid user data';
      return res.status(400).json({ message });
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: 'This email is already registered. Please login instead.' });
    }

    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
      planExpiry: user.planExpiry,
      trialUsed: user.trialUsed,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
      planExpiry: user.planExpiry,
      trialUsed: user.trialUsed,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    if (typeof req.body.avatar === 'string') {
      const avatar = req.body.avatar.trim();

      if (avatar && !avatar.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Please upload a valid image' });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { avatar },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt
      });
    }

    res.status(400).json({ message: 'No profile changes provided' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Please enter your email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: 'If that email exists, a password reset link has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    await sendMail({
      to: user.email,
      subject: 'Reset your Travel Planner password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #111827;">
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>Click the button below to reset your password. This link will expire in 15 minutes.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;background:#ff5a47;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;">
              Reset Password
            </a>
          </p>
          <p>If the button does not work, open this link:</p>
          <p style="word-break:break-all;">${resetUrl}</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `
    });

    res.json({
      message: 'If that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: process.env.NODE_ENV === 'production'
        ? 'Failed to send password reset email'
        : `Failed to send reset link: ${error.message}`
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Password reset link is invalid or expired' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      message: 'Password reset successful. You can login now.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Select or change subscription plan
// @route   PUT /api/auth/plan
// @access  Private
const selectPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const allowed = ['trial', 'monthly', '3-month', '6-month', 'yearly', 'none'];

    if (!plan || !allowed.includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const user = await User.findById(req.user._id).select('plan trialUsed');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (plan === 'trial' && user.trialUsed) {
      return res.status(400).json({ message: 'Trial already used. Please choose a paid plan.' });
    }

    const now = Date.now();
    let expiry = null;

    switch (plan) {
      case 'trial':
        expiry = new Date(now + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        expiry = new Date(now + 30 * 24 * 60 * 60 * 1000);
        break;
      case '3-month':
        expiry = new Date(now + 90 * 24 * 60 * 60 * 1000);
        break;
      case '6-month':
        expiry = new Date(now + 180 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        expiry = new Date(now + 365 * 24 * 60 * 60 * 1000);
        break;
      case 'none':
      default:
        expiry = null;
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        plan,
        planStart: new Date(now),
        planExpiry: expiry,
        trialUsed: plan === 'trial' ? true : user.trialUsed
      },
      { new: true, runValidators: true }
    );

    return res.json({
      _id: updated._id,
      plan: updated.plan,
      planStart: updated.planStart,
      planExpiry: updated.planExpiry,
      trialUsed: updated.trialUsed
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  selectPlan
};
