const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');

describe('Flight Tier System - User Model', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user
    testUser = new User({
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      phone: '+420123456789',
      platformTier: 0
    });
    await testUser.save();
  });

  afterEach(async () => {
    // Clean up
    await User.deleteMany({});
  });

  describe('Tier Initialization', () => {
    test('should initialize new user as Tier 0 (Prospective Visitor)', () => {
      expect(testUser.platformTier).toBe(0);
      expect(testUser.isBrowsingProspect()).toBe(true);
      expect(testUser.getTierDescription()).toBe('Prospective Visitor');
    });

    test('should have all services disabled by default', () => {
      expect(testUser.transportPermissions.routeAutomation).toBe(false);
      expect(testUser.transportPermissions.manualOperation).toBe(false);
      expect(testUser.transportPermissions.freightHandling).toBe(false);
    });
  });

  describe('Tier Check Methods', () => {
    test('should correctly identify tier 0 user', () => {
      expect(testUser.isBrowsingProspect()).toBe(true);
      expect(testUser.isSubscribedMember()).toBe(false);
      expect(testUser.isSystemOverseer()).toBe(false);
      expect(testUser.isTechCrew()).toBe(false);
    });

    test('should correctly identify tier 1 user', async () => {
      testUser.platformTier = 1;
      await testUser.save();
      
      expect(testUser.isBrowsingProspect()).toBe(false);
      expect(testUser.isSubscribedMember()).toBe(true);
      expect(testUser.isSystemOverseer()).toBe(false);
      expect(testUser.isTechCrew()).toBe(false);
    });

    test('should correctly identify tier 2 user', async () => {
      testUser.platformTier = 2;
      await testUser.save();
      
      expect(testUser.isBrowsingProspect()).toBe(false);
      expect(testUser.isSubscribedMember()).toBe(false);
      expect(testUser.isSystemOverseer()).toBe(true);
      expect(testUser.isTechCrew()).toBe(false);
    });

    test('should correctly identify tier 3 user', async () => {
      testUser.platformTier = 3;
      await testUser.save();
      
      expect(testUser.isBrowsingProspect()).toBe(false);
      expect(testUser.isSubscribedMember()).toBe(false);
      expect(testUser.isSystemOverseer()).toBe(false);
      expect(testUser.isTechCrew()).toBe(true);
    });
  });

  describe('Tier Elevation', () => {
    test('should elevate from Tier 0 to Tier 1 (subscriber)', async () => {
      await testUser.elevateToSubscriber();
      
      expect(testUser.platformTier).toBe(1);
      expect(testUser.isSubscribedMember()).toBe(true);
      expect(testUser.onboardingCompletedAt).toBeTruthy();
    });

    test('should not allow elevation to subscriber from non-Tier 0', async () => {
      testUser.platformTier = 1;
      await testUser.save();
      
      await expect(testUser.elevateToSubscriber()).rejects.toThrow(
        'Can only elevate from Tier 0 (Prospective Visitor)'
      );
    });

    test('should appoint overseer with admin permissions', async () => {
      const admin = new User({
        email: 'admin@example.com',
        password: 'hashedpassword',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+420987654321',
        platformTier: 2,
        userLevel: 'enterprise'
      });
      await admin.save();

      await testUser.appointOverseer(admin);
      
      expect(testUser.platformTier).toBe(2);
      expect(testUser.isSystemOverseer()).toBe(true);
      expect(testUser.transportPermissions.routeAutomation).toBe(false);
    });

    test('should assign tech crew with admin permissions', async () => {
      const admin = new User({
        email: 'admin@example.com',
        password: 'hashedpassword',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+420987654321',
        platformTier: 2,
        userLevel: 'enterprise'
      });
      await admin.save();

      await testUser.assignTechCrew(admin);
      
      expect(testUser.platformTier).toBe(3);
      expect(testUser.isTechCrew()).toBe(true);
      expect(testUser.transportPermissions.routeAutomation).toBe(false);
    });
  });

  describe('Service Toggles', () => {
    beforeEach(async () => {
      // Elevate to subscriber for service tests
      await testUser.elevateToSubscriber();
    });

    test('should toggle auto taxi service', async () => {
      expect(testUser.transportPermissions.routeAutomation).toBe(false);
      
      await testUser.toggleAutoTaxi();
      expect(testUser.transportPermissions.routeAutomation).toBe(true);
      
      await testUser.toggleAutoTaxi();
      expect(testUser.transportPermissions.routeAutomation).toBe(false);
    });

    test('should toggle pilot rental service', async () => {
      expect(testUser.transportPermissions.manualOperation).toBe(false);
      
      await testUser.togglePilotRental();
      expect(testUser.transportPermissions.manualOperation).toBe(true);
      
      await testUser.togglePilotRental();
      expect(testUser.transportPermissions.manualOperation).toBe(false);
    });

    test('should toggle cargo logistics service', async () => {
      expect(testUser.transportPermissions.freightHandling).toBe(false);
      
      await testUser.toggleCargoLogistics();
      expect(testUser.transportPermissions.freightHandling).toBe(true);
      
      await testUser.toggleCargoLogistics();
      expect(testUser.transportPermissions.freightHandling).toBe(false);
    });

    test('should not allow service toggle for non-subscribers', async () => {
      testUser.platformTier = 0;
      await testUser.save();
      
      await expect(testUser.toggleAutoTaxi()).rejects.toThrow(
        'Only Active Subscribers (Tier 1) can toggle services'
      );
    });
  });

  describe('Service Permissions', () => {
    beforeEach(async () => {
      await testUser.elevateToSubscriber();
    });

    test('should check auto taxi permission correctly', async () => {
      expect(testUser.autoTaxiAllowed()).toBe(false);
      
      await testUser.toggleAutoTaxi();
      expect(testUser.autoTaxiAllowed()).toBe(true);
    });

    test('should check pilot rental permission correctly', async () => {
      expect(testUser.pilotRentalAllowed()).toBe(false);
      
      await testUser.togglePilotRental();
      expect(testUser.pilotRentalAllowed()).toBe(true);
    });

    test('should check cargo logistics permission correctly', async () => {
      expect(testUser.cargoLogisticsAllowed()).toBe(false);
      
      await testUser.toggleCargoLogistics();
      expect(testUser.cargoLogisticsAllowed()).toBe(true);
    });
  });

  describe('Helper Methods', () => {
    test('should return correct tier descriptions', () => {
      expect(testUser.getTierDescription()).toBe('Prospective Visitor');
      
      testUser.platformTier = 1;
      expect(testUser.getTierDescription()).toBe('Active Subscriber');
      
      testUser.platformTier = 2;
      expect(testUser.getTierDescription()).toBe('System Overseer');
      
      testUser.platformTier = 3;
      expect(testUser.getTierDescription()).toBe('Technical Crew');
    });

    test('should return subscriber services for Tier 1', async () => {
      await testUser.elevateToSubscriber();
      await testUser.toggleAutoTaxi();
      
      const services = testUser.getSubscriberServices();
      expect(services).toEqual({
        autoTaxi: true,
        pilotRental: false,
        cargoLogistics: false
      });
    });

    test('should return null for non-subscriber services', () => {
      const services = testUser.getSubscriberServices();
      expect(services).toBeNull();
    });
  });
});
