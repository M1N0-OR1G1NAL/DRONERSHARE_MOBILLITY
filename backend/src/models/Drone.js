const mongoose = require('mongoose');

const droneSchema = new mongoose.Schema({
  droneId: {
    type: String,
    required: true,
    unique: true
  },
  model: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'charging', 'maintenance', 'offline'],
    default: 'available'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    altitude: Number
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  specifications: {
    maxRange: {
      type: Number, // in kilometers
      required: true
    },
    maxPayload: {
      type: Number, // in kilograms
      required: true
    },
    maxSpeed: {
      type: Number, // in km/h
      required: true
    },
    passengerCapacity: {
      type: Number,
      default: 1
    },
    hasSolarPanels: {
      type: Boolean,
      default: true
    }
  },
  sensors: {
    gps: Boolean,
    lidar: Boolean,
    cameras: Number,
    collisionAvoidance: Boolean,
    weatherSensors: Boolean
  },
  serviceLevel: {
    type: String,
    enum: ['level1', 'level2', 'level3'],
    default: 'level1'
  },
  currentDockStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DockStation'
  },
  lastMaintenance: Date,
  totalFlightHours: {
    type: Number,
    default: 0
  },
  totalFlights: {
    type: Number,
    default: 0
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

droneSchema.index({ currentLocation: '2dsphere' });
droneSchema.index({ status: 1 });
droneSchema.index({ droneId: 1 });

module.exports = mongoose.model('Drone', droneSchema);
