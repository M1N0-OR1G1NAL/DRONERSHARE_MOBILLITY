const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Test database setup
beforeAll(async () => {
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/dronershare-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
});

// Clear database before each test
beforeEach(async () => {
  await User.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Flight Tier System - User Model', () => {
  describe('Tier Query Methods', () => {
    test('browsingProspect() should return true for tier 0', async () => {
      const user = new User({
        email: 'visitor@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+420123456789',
        platformTier: 0
      });
      await user.save();
      
      expect(user.browsingProspect()).toBe(true);
      expect(user.subscribedMember()).toBe(false);
      expect(user.systemOverseer()).toBe(false);
      expect(user.techCrew()).toBe(false);
    });

    test('subscribedMember() should return true for tier 1', async () => {
      const user = new User({
        email: 'subscriber@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+420123456789',
        platformTier: 1
      });
      await user.save();
      
      expect(user.browsingProspect()).toBe(false);
      expect(user.subscribedMember()).toBe(true);
      expect(user.systemOverseer()).toBe(false);
      expect(user.techCrew()).toBe(false);
    });

    test('systemOverseer() should return true for tier 2', async () => {
      const user = new User({
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+420123456789',
        platformTier: 2
      });
      await user.save();
      
      expect(user.systemOverseer()).toBe(true);
    });

    test('techCrew() should return true for tier 3', async () => {
      const user = new User({
        email: 'tech@example.com',
        password: 'password123',
        firstName: 'Tech',
        lastName: 'Crew',
        phone: '+420123456789',
        platformTier: 3
      });
      await user.save();
      
      expect(user.techCrew()).toBe(true);
    });
  });

  describe('Tier Elevation Methods', () => {
    test('elevateToSubscriber() should upgrade tier 0 to tier 1', async () => {
      const user = new User({
        email: 'visitor@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+420123456789',
        platformTier: 0
      });
      await user.save();
      
      await user.elevateToSubscriber();
      
      expect(user.platformTier).toBe(1);
      expect(user.onboardingCompletedAt).toBeDefined();
      expect(user.transportPermissions.get('route_automation')).toBe(false);
      expect(user.transportPermissions.get('manual_operation')).toBe(false);
      expect(user.transportPermissions.get('freight_handling')).toBe(false);
    });

    test('appointOverseer() should upgrade to tier 2', async () => {
      const user = new User({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+420123456789',
        platformTier: 1
      });
      await user.save();
      
      await user.appointOverseer();
      
      expect(user.platformTier).toBe(2);
      expect(user.transportPermissions.size).toBe(0); // Services should be cleared
    });

    test('assignTechCrew() should upgrade to tier 3', async () => {
      const user = new User({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+420123456789',
        platformTier: 1
      });
      await user.save();
      
      await user.assignTechCrew();
      
      expect(user.platformTier).toBe(3);
      expect(user.transportPermissions.size).toBe(0); // Services should be cleared
    });
  });

  describe('Service Management Methods', () => {
    test('toggleAutoTaxi() should toggle route_automation service', async () => {
      const user = new User({
        email: 'subscriber@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+420123456789',
        platformTier: 1
      });
      await user.elevateToSubscriber();
      
      // Initially false
      expect(user.transportPermissions.get('route_automation')).toBe(false);
      
      // Toggle to true
      await user.toggleAutoTaxi();
      expect(user.transportPermissions.get('route_automation')).toBe(true);
      
      // Toggle back to false
      await user.toggleAutoTaxi();
      expect(user.transportPermissions.get('route_automation')).toBe(false);
    });

    test('service toggles should only work for tier 1 users', async () => {
      const user = new User({
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+420123456789',
        platformTier: 2
      });
      await user.save();
      
      await user.toggleAutoTaxi();
      expect(user.transportPermissions.get('route_automation')).toBeUndefined();
    });

    test('service permission checks should return correct values', async () => {
      const user = new User({
        email: 'subscriber@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+420123456789',
        platformTier: 1
      });
      await user.elevateToSubscriber();
      
      // Initially all false
      expect(user.autoTaxiAllowed()).toBe(false);
      expect(user.pilotRentalAllowed()).toBe(false);
      expect(user.cargoLogisticsAllowed()).toBe(false);
      
      // Enable route automation
      await user.toggleAutoTaxi();
      expect(user.autoTaxiAllowed()).toBe(true);
      
      // Enable manual operation
      await user.togglePilotRental();
      expect(user.pilotRentalAllowed()).toBe(true);
      
      // Enable freight handling
      await user.toggleCargoLogistics();
      expect(user.cargoLogisticsAllowed()).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    test('tierDescription() should return correct descriptions', async () => {
      const tier0 = new User({ email: 't0@test.com', password: 'pass', firstName: 'T', lastName: '0', phone: '123', platformTier: 0 });
      const tier1 = new User({ email: 't1@test.com', password: 'pass', firstName: 'T', lastName: '1', phone: '123', platformTier: 1 });
      const tier2 = new User({ email: 't2@test.com', password: 'pass', firstName: 'T', lastName: '2', phone: '123', platformTier: 2 });
      const tier3 = new User({ email: 't3@test.com', password: 'pass', firstName: 'T', lastName: '3', phone: '123', platformTier: 3 });
      
      expect(tier0.tierDescription()).toBe('Prospective Visitor');
      expect(tier1.tierDescription()).toBe('Active Subscriber');
      expect(tier2.tierDescription()).toBe('System Overseer');
      expect(tier3.tierDescription()).toBe('Technical Crew');
    });

    test('subscriberServices() should return enabled services', async () => {
      const user = new User({
        email: 'subscriber@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+420123456789',
        platformTier: 1
      });
      await user.elevateToSubscriber();
      
      // Initially empty
      expect(user.subscriberServices()).toEqual([]);
      
      // Enable services
      await user.toggleAutoTaxi();
      await user.toggleCargoLogistics();
      
      const services = user.subscriberServices();
      expect(services).toContain('route_automation');
      expect(services).toContain('freight_handling');
      expect(services).not.toContain('manual_operation');
    });

    test('subscriberServices() should return empty array for non-tier-1 users', async () => {
      const user = new User({
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+420123456789',
        platformTier: 2
      });
      await user.save();
      
      expect(user.subscriberServices()).toEqual([]);
    });
  });
});

describe('Flight Tier System - API Integration', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Create a test user and get auth token
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({
      email: 'testuser@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+420123456789',
      platformTier: 0
    });
    await user.save();
    userId = user._id;
    
    // Generate token
    authToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  });

  describe('Authentication API', () => {
    test('POST /api/auth/register should create new user with tier 0', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          phone: '+420987654321'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.tier).toBe(0);
      expect(response.body.user.tierDescription).toBe('Prospective Visitor');
    });

    test('POST /api/auth/login should return user tier information', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('tier');
      expect(response.body.user).toHaveProperty('tierDescription');
    });
  });

  describe('Flight Access Dashboard API', () => {
    test('GET /api/flight-access should return dashboard data', async () => {
      const response = await request(app)
        .get('/api/flight-access')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('tier', 0);
      expect(response.body).toHaveProperty('tierDescription', 'Prospective Visitor');
      expect(response.body).toHaveProperty('email', 'testuser@example.com');
    });

    test('GET /api/flight-access should require authentication', async () => {
      const response = await request(app)
        .get('/api/flight-access');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Tier Elevation API', () => {
    test('POST /api/flight-access/elevate/1 should upgrade tier 0 to tier 1', async () => {
      const response = await request(app)
        .post('/api/flight-access/elevate/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tier).toBe(1);
      expect(response.body.tierDescription).toBe('Active Subscriber');

      // Verify in database
      const user = await User.findById(userId);
      expect(user.platformTier).toBe(1);
      expect(user.onboardingCompletedAt).toBeDefined();
    });

    test('POST /api/flight-access/elevate/1 should initialize service permissions', async () => {
      await request(app)
        .post('/api/flight-access/elevate/1')
        .set('Authorization', `Bearer ${authToken}`);

      const user = await User.findById(userId);
      expect(user.transportPermissions.get('route_automation')).toBe(false);
      expect(user.transportPermissions.get('manual_operation')).toBe(false);
      expect(user.transportPermissions.get('freight_handling')).toBe(false);
    });
  });

  describe('Service Toggle API', () => {
    beforeEach(async () => {
      // Upgrade user to tier 1 first
      const user = await User.findById(userId);
      await user.elevateToSubscriber();
    });

    test('POST /api/flight-access/service/route_automation should toggle service', async () => {
      const response = await request(app)
        .post('/api/flight-access/service/route_automation')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.enabled).toBe(true);
      expect(response.body.allServices.route_automation).toBe(true);

      // Verify in database
      const user = await User.findById(userId);
      expect(user.autoTaxiAllowed()).toBe(true);
    });

    test('service toggle should work for all three services', async () => {
      // Toggle all services
      await request(app)
        .post('/api/flight-access/service/route_automation')
        .set('Authorization', `Bearer ${authToken}`);
      
      await request(app)
        .post('/api/flight-access/service/manual_operation')
        .set('Authorization', `Bearer ${authToken}`);
      
      await request(app)
        .post('/api/flight-access/service/freight_handling')
        .set('Authorization', `Bearer ${authToken}`);

      const user = await User.findById(userId);
      expect(user.autoTaxiAllowed()).toBe(true);
      expect(user.pilotRentalAllowed()).toBe(true);
      expect(user.cargoLogisticsAllowed()).toBe(true);
    });

    test('service toggle should fail for non-subscriber', async () => {
      // Downgrade user back to tier 0
      const user = await User.findById(userId);
      user.platformTier = 0;
      await user.save();

      const response = await request(app)
        .post('/api/flight-access/service/route_automation')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.error).toContain('Active Subscribers');
    });
  });
});
