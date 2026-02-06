const mongoose = require('mongoose');

const dockStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String,
    city: String,
    country: String
  },
  capacity: {
    total: {
      type: Number,
      required: true
    },
    available: {
      type: Number,
      required: true
    }
  },
  chargingStations: {
    solar: {
      count: Number,
      totalPower: Number, // in kW
      currentOutput: Number
    },
    wind: {
      count: Number,
      totalPower: Number, // in kW
      currentOutput: Number
    },
    grid: {
      count: Number,
      totalPower: Number
    }
  },
  dronesCurrently: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone'
  }],
  operatingHours: {
    start: String, // e.g., "06:00"
    end: String // e.g., "22:00"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  weatherConditions: {
    temperature: Number,
    windSpeed: Number,
    visibility: Number,
    lastUpdated: Date
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

dockStationSchema.index({ location: '2dsphere' });
dockStationSchema.index({ isActive: 1 });

module.exports = mongoose.model('DockStation', dockStationSchema);
