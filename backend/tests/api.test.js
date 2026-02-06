const request = require('supertest');
const app = require('../src/server');

describe('API Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  test('GET / should return API info', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('endpoints');
  });
});

describe('Drones API', () => {
  test('GET /api/drones should return available drones', async () => {
    const response = await request(app).get('/api/drones');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('drones');
    expect(Array.isArray(response.body.drones)).toBe(true);
  });

  test('GET /api/drones with location should filter by proximity', async () => {
    const response = await request(app)
      .get('/api/drones')
      .query({ lat: 50.0755, lng: 14.4378, radius: 50 });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('drones');
  });
});

describe('Route Optimization Service', () => {
  const routeOptimization = require('../src/services/routeOptimization');

  test('should calculate distance between two points', () => {
    const point1 = { lat: 50.0755, lng: 14.4378 };
    const point2 = { lat: 50.0875, lng: 14.4214 };
    const distance = routeOptimization.calculateDistance(point1, point2);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(5); // Should be a few km
  });

  test('should calculate optimal route', async () => {
    const start = { lat: 50.0755, lng: 14.4378 };
    const end = { lat: 50.0875, lng: 14.4214 };
    const route = await routeOptimization.calculateOptimalRoute(start, end);
    
    expect(route).toHaveProperty('waypoints');
    expect(route).toHaveProperty('distance');
    expect(route).toHaveProperty('estimatedDuration');
    expect(route).toHaveProperty('energyRequired');
    expect(Array.isArray(route.waypoints)).toBe(true);
    expect(route.distance).toBeGreaterThan(0);
  });
});

describe('Energy Management Service', () => {
  const energyManagement = require('../src/services/energyManagement');

  test('should check battery status', async () => {
    const drone = {
      batteryLevel: 80,
      specifications: { hasSolarPanels: true }
    };
    const requiredEnergy = 30;
    
    const status = await energyManagement.checkBatteryStatus(drone, requiredEnergy);
    
    expect(status).toHaveProperty('hasSufficient');
    expect(status).toHaveProperty('currentLevel', 80);
    expect(status).toHaveProperty('requiredEnergy', 30);
    expect(status.hasSufficient).toBe(true);
  });

  test('should detect insufficient battery', async () => {
    const drone = { batteryLevel: 30 };
    const requiredEnergy = 40;
    
    const status = await energyManagement.checkBatteryStatus(drone, requiredEnergy);
    
    expect(status.hasSufficient).toBe(false);
    expect(status.recommendation).toBe('INSUFFICIENT_FOR_ROUTE');
  });

  test('should select optimal drone from fleet', () => {
    const drones = [
      { _id: '1', batteryLevel: 95 },
      { _id: '2', batteryLevel: 60 },
      { _id: '3', batteryLevel: 85 }
    ];
    const requiredEnergy = 40;
    
    const selected = energyManagement.selectOptimalDrone(drones, requiredEnergy);
    
    expect(selected).toBeTruthy();
    expect(selected.batteryLevel).toBeGreaterThanOrEqual(55); // required + 15% safety
  });
});
