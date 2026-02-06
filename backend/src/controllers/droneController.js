const Drone = require('../models/Drone');
const DockStation = require('../models/DockStation');
const energyManagement = require('../services/energyManagement');

class DroneController {
  /**
   * Get all available drones
   */
  async getAvailableDrones(req, res) {
    try {
      const { lat, lng, radius = 50, serviceLevel } = req.query;

      const query = { status: 'available', isActive: true };

      if (serviceLevel) {
        query.serviceLevel = serviceLevel;
      }

      let drones;

      if (lat && lng) {
        // Find drones near location
        drones = await Drone.find({
          ...query,
          currentLocation: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
              },
              $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
            }
          }
        }).limit(20);
      } else {
        drones = await Drone.find(query).limit(20);
      }

      res.json({ drones, count: drones.length });
    } catch (error) {
      console.error('Error fetching available drones:', error);
      res.status(500).json({ error: 'Failed to fetch drones' });
    }
  }

  /**
   * Get drone by ID
   */
  async getDrone(req, res) {
    try {
      const { id } = req.params;
      const drone = await Drone.findById(id).populate('currentDockStation');

      if (!drone) {
        return res.status(404).json({ error: 'Drone not found' });
      }

      res.json(drone);
    } catch (error) {
      console.error('Error fetching drone:', error);
      res.status(500).json({ error: 'Failed to fetch drone' });
    }
  }

  /**
   * Get drone real-time location and status
   */
  async getDroneStatus(req, res) {
    try {
      const { id } = req.params;
      const drone = await Drone.findById(id);

      if (!drone) {
        return res.status(404).json({ error: 'Drone not found' });
      }

      // Check battery status
      const batteryStatus = await energyManagement.checkBatteryStatus(
        drone,
        10 // Minimum 10% for safety check
      );

      res.json({
        droneId: drone.droneId,
        status: drone.status,
        location: {
          lat: drone.currentLocation.coordinates[1],
          lng: drone.currentLocation.coordinates[0],
          altitude: drone.currentLocation.altitude
        },
        batteryLevel: drone.batteryLevel,
        batteryStatus,
        currentDockStation: drone.currentDockStation,
        lastUpdated: drone.updatedAt
      });
    } catch (error) {
      console.error('Error fetching drone status:', error);
      res.status(500).json({ error: 'Failed to fetch drone status' });
    }
  }

  /**
   * Get nearby dock stations
   */
  async getNearbyDockStations(req, res) {
    try {
      const { lat, lng, radius = 50 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          error: 'Location coordinates (lat, lng) required'
        });
      }

      const stations = await DockStation.find({
        isActive: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseFloat(radius) * 1000
          }
        }
      }).limit(10);

      // Add energy info for each station
      const stationsWithEnergy = await Promise.all(
        stations.map(async (station) => {
          const energyInfo = await energyManagement.monitorRenewableEnergy(
            station._id
          );
          return {
            ...station.toObject(),
            energyInfo
          };
        })
      );

      res.json({ stations: stationsWithEnergy, count: stations.length });
    } catch (error) {
      console.error('Error fetching dock stations:', error);
      res.status(500).json({ error: 'Failed to fetch dock stations' });
    }
  }

  /**
   * Get drone fleet statistics (admin only)
   */
  async getFleetStatistics(req, res) {
    try {
      const totalDrones = await Drone.countDocuments({ isActive: true });
      const availableDrones = await Drone.countDocuments({
        status: 'available',
        isActive: true
      });
      const chargingDrones = await Drone.countDocuments({
        status: 'charging'
      });
      const inUseDrones = await Drone.countDocuments({ status: 'in_use' });

      const avgBattery = await Drone.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avgBattery: { $avg: '$batteryLevel' } } }
      ]);

      const totalFlightHours = await Drone.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalHours: { $sum: '$totalFlightHours' } } }
      ]);

      res.json({
        fleet: {
          total: totalDrones,
          available: availableDrones,
          charging: chargingDrones,
          inUse: inUseDrones,
          maintenance: totalDrones - availableDrones - chargingDrones - inUseDrones
        },
        averageBatteryLevel: avgBattery[0]?.avgBattery || 0,
        totalFlightHours: totalFlightHours[0]?.totalHours || 0
      });
    } catch (error) {
      console.error('Error fetching fleet statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  /**
   * Update drone location (from IoT device)
   */
  async updateDroneLocation(req, res) {
    try {
      const { id } = req.params;
      const { lat, lng, altitude, batteryLevel } = req.body;

      const drone = await Drone.findById(id);

      if (!drone) {
        return res.status(404).json({ error: 'Drone not found' });
      }

      drone.currentLocation.coordinates = [lng, lat];
      if (altitude) drone.currentLocation.altitude = altitude;
      if (batteryLevel !== undefined) drone.batteryLevel = batteryLevel;
      drone.updatedAt = new Date();

      await drone.save();

      res.json({ message: 'Location updated', drone });
    } catch (error) {
      console.error('Error updating drone location:', error);
      res.status(500).json({ error: 'Failed to update location' });
    }
  }
}

module.exports = new DroneController();
