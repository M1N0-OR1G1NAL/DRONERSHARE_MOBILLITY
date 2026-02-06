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
  // Flight Tier System (4 phases as per requirements)
  platformTier: {
    type: Number,
    enum: [0, 1, 2, 3],
    default: 0,
    // 0: Prospective Visitor (unregistered/browse-only)
    // 1: Active Subscriber (registered user with services)
    // 2: System Overseer (administrator)
    // 3: Technical Crew (maintenance staff)
  },
  transportPermissions: {
    routeAutomation: { type: Boolean, default: false },    // Service a: Automated taxi
    manualOperation: { type: Boolean, default: false },    // Service b: Drone rental/self-piloting
    freightHandling: { type: Boolean, default: false }     // Service c: Package transport/logistics
  },
  onboardingCompletedAt: {
    type: Date,
    default: null
  },
  tierNotes: {
    type: String,
    default: ''
  // Flight Tier System fields
  platformTier: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  transportPermissions: {
    type: Map,
    of: Boolean,
    default: {}
  },
  onboardingCompletedAt: {
    type: Date
  },
  tierNotes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
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

// Tier check methods
userSchema.methods.isBrowsingProspect = function() {
  return this.platformTier === 0;
};

userSchema.methods.isSubscribedMember = function() {
  return this.platformTier === 1;
};

userSchema.methods.isSystemOverseer = function() {
  return this.platformTier === 2;
};

userSchema.methods.isTechCrew = function() {
// Tier query methods
userSchema.methods.browsingProspect = function() {
  return this.platformTier === 0;
};

userSchema.methods.subscribedMember = function() {
  return this.platformTier === 1;
};

userSchema.methods.systemOverseer = function() {
  return this.platformTier === 2;
};

userSchema.methods.techCrew = function() {
  return this.platformTier === 3;
};

// Tier elevation methods
userSchema.methods.elevateToSubscriber = async function() {
  if (this.platformTier !== 0) {
    throw new Error('Can only elevate from Tier 0 (Prospective Visitor)');
  }
  this.platformTier = 1;
  this.onboardingCompletedAt = new Date();
  await this.save();
  return this;
};

userSchema.methods.appointOverseer = async function(adminUser) {
  if (!adminUser || (!adminUser.isSystemOverseer() && adminUser.userLevel !== 'enterprise')) {
    throw new Error('Only super_admin or overseer can appoint overseer');
  }
  this.platformTier = 2;
  this.transportPermissions = {
    routeAutomation: false,
    manualOperation: false,
    freightHandling: false
  };
  await this.save();
  return this;
};

userSchema.methods.assignTechCrew = async function(adminUser) {
  if (!adminUser || (!adminUser.isSystemOverseer() && adminUser.userLevel !== 'enterprise')) {
    throw new Error('Only super_admin or overseer can assign tech crew');
  }
  this.platformTier = 3;
  this.transportPermissions = {
    routeAutomation: false,
    manualOperation: false,
    freightHandling: false
  };
  await this.save();
  return this;
};

// Service toggle methods (for Tier 1 only)
userSchema.methods.toggleAutoTaxi = async function() {
  if (!this.isSubscribedMember()) {
    throw new Error('Only Active Subscribers (Tier 1) can toggle services');
  }
  this.transportPermissions.routeAutomation = !this.transportPermissions.routeAutomation;
  await this.save();
  return this;
};

userSchema.methods.togglePilotRental = async function() {
  if (!this.isSubscribedMember()) {
    throw new Error('Only Active Subscribers (Tier 1) can toggle services');
  }
  this.transportPermissions.manualOperation = !this.transportPermissions.manualOperation;
  await this.save();
  return this;
};

userSchema.methods.toggleCargoLogistics = async function() {
  if (!this.isSubscribedMember()) {
    throw new Error('Only Active Subscribers (Tier 1) can toggle services');
  }
  this.transportPermissions.freightHandling = !this.transportPermissions.freightHandling;
  await this.save();
  return this;
};

// Service check methods
userSchema.methods.autoTaxiAllowed = function() {
  return this.isSubscribedMember() && this.transportPermissions.routeAutomation;
};

userSchema.methods.pilotRentalAllowed = function() {
  return this.isSubscribedMember() && this.transportPermissions.manualOperation;
};

userSchema.methods.cargoLogisticsAllowed = function() {
  return this.isSubscribedMember() && this.transportPermissions.freightHandling;
};

// Tier description
userSchema.methods.getTierDescription = function() {
  this.platformTier = 1;
  this.onboardingCompletedAt = new Date();
  // Initialize default service permissions
  this.transportPermissions = new Map([
    ['route_automation', false],
    ['manual_operation', false],
    ['freight_handling', false]
  ]);
  return await this.save();
};

userSchema.methods.appointOverseer = async function() {
  this.platformTier = 2;
  this.transportPermissions = new Map(); // Clear subscriber services
  return await this.save();
};

userSchema.methods.assignTechCrew = async function() {
  this.platformTier = 3;
  this.transportPermissions = new Map(); // Clear subscriber services
  return await this.save();
};

// Service management methods (Tier 1 only)
userSchema.methods.toggleAutoTaxi = async function() {
  if (this.platformTier !== 1) return this;
  const current = this.transportPermissions.get('route_automation') || false;
  this.transportPermissions.set('route_automation', !current);
  return await this.save();
};

userSchema.methods.togglePilotRental = async function() {
  if (this.platformTier !== 1) return this;
  const current = this.transportPermissions.get('manual_operation') || false;
  this.transportPermissions.set('manual_operation', !current);
  return await this.save();
};

userSchema.methods.toggleCargoLogistics = async function() {
  if (this.platformTier !== 1) return this;
  const current = this.transportPermissions.get('freight_handling') || false;
  this.transportPermissions.set('freight_handling', !current);
  return await this.save();
};

// Service permission checks
userSchema.methods.autoTaxiAllowed = function() {
  return this.platformTier === 1 && this.transportPermissions.get('route_automation') === true;
};

userSchema.methods.pilotRentalAllowed = function() {
  return this.platformTier === 1 && this.transportPermissions.get('manual_operation') === true;
};

userSchema.methods.cargoLogisticsAllowed = function() {
  return this.platformTier === 1 && this.transportPermissions.get('freight_handling') === true;
};

// Utility methods
userSchema.methods.tierDescription = function() {
  const descriptions = {
    0: 'Prospective Visitor',
    1: 'Active Subscriber',
    2: 'System Overseer',
    3: 'Technical Crew'
  };
  return descriptions[this.platformTier] || 'Unknown';
};

// Get subscriber services status
userSchema.methods.getSubscriberServices = function() {
  if (!this.isSubscribedMember()) {
    return null;
  }
  return {
    autoTaxi: this.transportPermissions.routeAutomation,
    pilotRental: this.transportPermissions.manualOperation,
    cargoLogistics: this.transportPermissions.freightHandling
  };
userSchema.methods.subscriberServices = function() {
  if (this.platformTier !== 1) return [];
  const services = [];
  if (this.transportPermissions.get('route_automation')) services.push('route_automation');
  if (this.transportPermissions.get('manual_operation')) services.push('manual_operation');
  if (this.transportPermissions.get('freight_handling')) services.push('freight_handling');
  return services;
};

module.exports = mongoose.model('User', userSchema);
