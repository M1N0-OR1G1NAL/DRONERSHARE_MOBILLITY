const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../src/server');
const User = require('../src/models/User');

describe('Flight Tier System - API Tests', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+420123456789',
      platformTier: 0
    });
    await testUser.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('Authentication API', () => {
    test('POST /api/auth/register should create new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          phone: '+420111222333'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        platformTier: 0,
        tierDescription: 'Prospective Visitor'
      });
    });

    test('POST /api/auth/register should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          phone: '+420123456789'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Email already registered');
    });

    test('POST /api/auth/login should authenticate valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: 'test@example.com',
        platformTier: 0,
        tierDescription: 'Prospective Visitor'
      });
    });

    test('POST /api/auth/login should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('GET /api/auth/profile should return user profile with auth', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toMatchObject({
        email: 'test@example.com',
        platformTier: 0,
        tierDescription: 'Prospective Visitor'
      });
    });

    test('GET /api/auth/profile should reject without auth', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Flight Access Dashboard API', () => {
    test('GET /api/flight-access/dashboard should return tier info', async () => {
      const response = await request(app)
        .get('/api/flight-access/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        tier: {
          level: 0,
          description: 'Prospective Visitor'
        },
        permissions: {
          isBrowsingProspect: true,
          isSubscribedMember: false,
          isSystemOverseer: false,
          isTechCrew: false
        }
      });
    });

    test('GET /api/flight-access/dashboard should require authentication', async () => {
      const response = await request(app)
        .get('/api/flight-access/dashboard');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Tier Elevation API', () => {
    test('POST /api/flight-access/elevate/subscriber should upgrade to Tier 1', async () => {
      const response = await request(app)
        .post('/api/flight-access/elevate/subscriber')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toMatchObject({
        platformTier: 1,
        tierDescription: 'Active Subscriber'
      });
      expect(response.body.user.onboardingCompletedAt).toBeTruthy();
    });

    test('POST /api/flight-access/elevate/subscriber should fail if not Tier 0', async () => {
      // First upgrade to subscriber
      await request(app)
        .post('/api/flight-access/elevate/subscriber')
        .set('Authorization', `Bearer ${authToken}`);

      // Try to upgrade again
      const response = await request(app)
        .post('/api/flight-access/elevate/subscriber')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(400);
    });

    test('POST /api/flight-access/elevate/overseer should require admin', async () => {
      const response = await request(app)
        .post('/api/flight-access/elevate/overseer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: testUser._id });

      expect(response.statusCode).toBe(403);
      expect(response.body.error).toContain('super_admin or overseer');
    });

    test('POST /api/flight-access/elevate/overseer should work with admin', async () => {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+420999888777',
        platformTier: 2,
        userLevel: 'enterprise'
      });
      await adminUser.save();

      const adminToken = jwt.sign(
        { userId: adminUser._id },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .post('/api/flight-access/elevate/overseer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: testUser._id.toString() });

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toMatchObject({
        platformTier: 2,
        tierDescription: 'System Overseer'
      });
    });
  });

  describe('Service Toggle API', () => {
    beforeEach(async () => {
      // Upgrade user to subscriber for service tests
      await request(app)
        .post('/api/flight-access/elevate/subscriber')
        .set('Authorization', `Bearer ${authToken}`);
    });

    test('POST /api/flight-access/service/auto-taxi should toggle service', async () => {
      const response = await request(app)
        .post('/api/flight-access/service/auto-taxi')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.services).toMatchObject({
        autoTaxi: true,
        pilotRental: false,
        cargoLogistics: false
      });
    });

    test('POST /api/flight-access/service/pilot-rental should toggle service', async () => {
      const response = await request(app)
        .post('/api/flight-access/service/pilot-rental')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.services).toMatchObject({
        autoTaxi: false,
        pilotRental: true,
        cargoLogistics: false
      });
    });

    test('POST /api/flight-access/service/cargo-logistics should toggle service', async () => {
      const response = await request(app)
        .post('/api/flight-access/service/cargo-logistics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.services).toMatchObject({
        autoTaxi: false,
        pilotRental: false,
        cargoLogistics: true
      });
    });

    test('POST /api/flight-access/service/invalid should return error', async () => {
      const response = await request(app)
        .post('/api/flight-access/service/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Invalid service name');
    });
  });

  describe('Service Toggle Restrictions', () => {
    test('Non-subscribers should not be able to toggle services', async () => {
      // User is Tier 0, should not be able to toggle
      const response = await request(app)
        .post('/api/flight-access/service/auto-taxi')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.error).toContain('Active Subscribers');
    });
  });
});
