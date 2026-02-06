const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  pilotLicense: {
    hasLicense: {
      type: Boolean,
      default: false
    },
    licenseNumber: String,
    licenseExpiry: Date,
    verified: {
      type: Boolean,
      default: false
    }
  },
  paymentMethods: [{
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal']
    },
    stripePaymentMethodId: String,
    last4: String,
    isDefault: Boolean
  }],
  userLevel: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
