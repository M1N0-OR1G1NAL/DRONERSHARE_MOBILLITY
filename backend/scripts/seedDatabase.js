/**
 * Database Seeder
 * Creates sample data for development and testing
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Drone = require('../src/models/Drone');
const DockStation = require('../src/models/DockStation');
const Reservation = require('../src/models/Reservation');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dronershare');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Drone.deleteMany({}),
      DockStation.deleteMany({}),
      Reservation.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create Dock Stations
    const stations = [
      {
        name: 'Prague Central Dock',
        location: {
          type: 'Point',
          coordinates: [14.4378, 50.0755],
          address: 'Wenceslas Square, Prague 1',
          city: 'Prague',
          country: 'Czech Republic'
        },
        capacity: { total: 20, available: 15 },
        chargingStations: {
          solar: { count: 10, totalPower: 50, currentOutput: 35 },
          wind: { count: 5, totalPower: 25, currentOutput: 15 },
          grid: { count: 5, totalPower: 30 }
        },
        operatingHours: { start: '06:00', end: '22:00' }
      },
      {
        name: 'Prague Airport Dock',
        location: {
          type: 'Point',
          coordinates: [14.2632, 50.1008],
          address: 'Václav Havel Airport Prague',
          city: 'Prague',
          country: 'Czech Republic'
        },
        capacity: { total: 30, available: 25 },
        chargingStations: {
          solar: { count: 15, totalPower: 75, currentOutput: 60 },
          wind: { count: 8, totalPower: 40, currentOutput: 25 },
          grid: { count: 7, totalPower: 50 }
        },
        operatingHours: { start: '00:00', end: '23:59' }
      },
      {
        name: 'Brno City Dock',
        location: {
          type: 'Point',
          coordinates: [16.6068, 49.1951],
          address: 'Freedom Square, Brno',
          city: 'Brno',
          country: 'Czech Republic'
        },
        capacity: { total: 15, available: 12 },
        chargingStations: {
          solar: { count: 8, totalPower: 40, currentOutput: 30 },
          wind: { count: 4, totalPower: 20, currentOutput: 12 },
          grid: { count: 3, totalPower: 20 }
        },
        operatingHours: { start: '06:00', end: '22:00' }
      }
    ];

    const createdStations = await DockStation.insertMany(stations);
    console.log(`Created ${createdStations.length} dock stations`);

    // Create Drones
    const droneModels = ['SkyTransport X1', 'AeroLift Pro', 'CloudRider 3000', 'SolarWing Elite'];
    const manufacturers = ['AeroTech', 'SkyDynamics', 'FutureFlight', 'GreenAir'];
    const serviceLevels = ['level1', 'level2', 'level3'];
    
    const drones = [];
    for (let i = 1; i <= 15; i++) {
      const station = createdStations[i % createdStations.length];
      drones.push({
        droneId: `DRN-${String(i).padStart(3, '0')}`,
        model: droneModels[i % droneModels.length],
        manufacturer: manufacturers[i % manufacturers.length],
        status: i <= 12 ? 'available' : (i === 13 ? 'charging' : 'in_use'),
        currentLocation: {
          type: 'Point',
          coordinates: station.location.coordinates,
          altitude: 0
        },
        batteryLevel: 50 + Math.random() * 50, // 50-100%
        specifications: {
          maxRange: 40 + Math.random() * 30, // 40-70 km
          maxPayload: 80 + Math.random() * 60, // 80-140 kg
          maxSpeed: 60 + Math.random() * 40, // 60-100 km/h
          passengerCapacity: i % 3 === 0 ? 2 : 1,
          hasSolarPanels: i % 2 === 0
        },
        sensors: {
          gps: true,
          lidar: true,
          cameras: 4 + (i % 4),
          collisionAvoidance: true,
          weatherSensors: true
        },
        serviceLevel: serviceLevels[i % serviceLevels.length],
        currentDockStation: station._id,
        totalFlightHours: Math.random() * 1000,
        totalFlights: Math.floor(Math.random() * 500)
      });
    }

    const createdDrones = await Drone.insertMany(drones);
    console.log(`Created ${createdDrones.length} drones`);

    // Create Sample Users
    const users = [
      {
        email: 'jan.novak@example.com',
        password: '$2a$10$XYZ...', // Hashed password (would be "password123")
        firstName: 'Jan',
        lastName: 'Novák',
        phone: '+420 123 456 789',
        pilotLicense: {
          hasLicense: true,
          licenseNumber: 'CZ-PILOT-12345',
          licenseExpiry: new Date('2025-12-31'),
          verified: true
        },
        userLevel: 'premium'
      },
      {
        email: 'petra.svoboda@example.com',
        password: '$2a$10$ABC...',
        firstName: 'Petra',
        lastName: 'Svobodová',
        phone: '+420 987 654 321',
        pilotLicense: {
          hasLicense: false
        },
        userLevel: 'basic'
      },
      {
        email: 'martin.dvorak@example.com',
        password: '$2a$10$DEF...',
        firstName: 'Martin',
        lastName: 'Dvořák',
        phone: '+420 555 123 456',
        pilotLicense: {
          hasLicense: true,
          licenseNumber: 'CZ-PILOT-67890',
          licenseExpiry: new Date('2026-06-30'),
          verified: true
        },
        userLevel: 'enterprise'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    console.log('\n=== Seed data created successfully! ===');
    console.log(`Dock Stations: ${createdStations.length}`);
    console.log(`Drones: ${createdDrones.length}`);
    console.log(`Users: ${createdUsers.length}`);
    console.log('\nSample credentials:');
    console.log('Email: jan.novak@example.com (Premium user with pilot license)');
    console.log('Email: petra.svoboda@example.com (Basic user)');
    console.log('Email: martin.dvorak@example.com (Enterprise user with pilot license)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run seeder
seedData();
