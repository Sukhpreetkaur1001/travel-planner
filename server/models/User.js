const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
  ,
  // Subscription fields
  plan: {
    type: String,
    enum: ['trial', 'monthly', '3-month', '6-month', 'yearly', 'none'],
    default: 'none'
  },
  planStart: Date,
  planExpiry: Date,
  trialUsed: {
    type: Boolean,
    default: false
  }
});

// Hash password before saving
userSchema.pre('save', async function () {

  if (!this.isModified('password')) {
    return
  }

  const salt = await bcrypt.genSalt(10)

  this.password = await bcrypt.hash(
    this.password,
    salt
  )
})
// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
