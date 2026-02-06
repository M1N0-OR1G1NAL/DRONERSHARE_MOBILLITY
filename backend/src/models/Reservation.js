const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    required: true
  },
  serviceLevel: {
    type: String,
    enum: ['level1', 'level2', 'level3'],
    required: true
  },
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  endLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  pickupType: {
    type: String,
    enum: ['fixed_location', 'user_location'], // level1 vs level2
    required: true
  },
  route: {
    distance: Number, // in kilometers
    estimatedDuration: Number, // in minutes
    waypoints: [[Number]], // array of [lng, lat] coordinates
    optimizedPath: String // JSON string of optimized route
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledTime: Date,
  actualStartTime: Date,
  actualEndTime: Date,
  preFlightPhotos: [{
    url: String,
    timestamp: Date,
    verified: Boolean
  }],
  postFlightPhotos: [{
    url: String,
    timestamp: Date,
    verified: Boolean
  }],
  payment: {
    amount: Number,
    currency: {
      type: String,
      default: 'CZK'
    },
    stripePaymentIntentId: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  estimatedCost: Number,
  legislativeCheck: {
    passed: Boolean,
    restrictions: [String],
    checkedAt: Date
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

reservationSchema.index({ user: 1 });
reservationSchema.index({ drone: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ scheduledTime: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
