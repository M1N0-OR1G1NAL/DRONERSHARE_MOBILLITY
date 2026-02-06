/**
 * Energy Management Service
 * Handles battery monitoring, charging station management, and solar/wind energy optimization
 */

const DockStation = require('../models/DockStation');
const Drone = require('../models/Drone');

class EnergyManagementService {
  constructor() {
    this.chargingThreshold = 20; // Minimum battery percentage before requiring charge
    this.optimalChargeLevel = 90; // Target charge level
  }

  /**
   * Check if drone has sufficient battery for route
   * @param {Object} drone - Drone document
   * @param {Number} requiredEnergy - Energy required in percentage
   * @returns {Object} Battery status and recommendations
   */
  async checkBatteryStatus(drone, requiredEnergy) {
    const currentBattery = drone.batteryLevel;
    const safetyMargin = 15; // Always keep 15% safety margin
    const totalRequired = requiredEnergy + safetyMargin;

    const hasSufficient = currentBattery >= totalRequired;

    return {
      hasSufficient,
      currentLevel: currentBattery,
      requiredEnergy,
      safetyMargin,
      totalRequired,
      estimatedRemainingAfterFlight: currentBattery - requiredEnergy,
      needsCharging: currentBattery < this.chargingThreshold,
      recommendation: this.getBatteryRecommendation(currentBattery, totalRequired)
    };
  }

  /**
   * Get battery recommendation
   */
  getBatteryRecommendation(currentLevel, required) {
    if (currentLevel < this.chargingThreshold) {
      return 'CHARGE_REQUIRED';
    } else if (currentLevel < required) {
      return 'INSUFFICIENT_FOR_ROUTE';
    } else if (currentLevel < required + 20) {
      return 'CHARGE_RECOMMENDED';
    } else {
      return 'SUFFICIENT';
    }
  }

  /**
   * Find nearest charging station
   * @param {Object} location - Current location {lat, lng}
   * @param {Number} maxDistance - Maximum distance in km
   * @returns {Object} Nearest dock station
   */
  async findNearestChargingStation(location, maxDistance = 50) {
    try {
      const stations = await DockStation.find({
        isActive: true,
        'capacity.available': { $gt: 0 },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.lng, location.lat]
            },
            $maxDistance: maxDistance * 1000 // Convert km to meters
          }
        }
      }).limit(5);

      if (stations.length === 0) {
        return null;
      }

      // Return station with best charging capacity
      return stations.reduce((best, current) => {
        const currentPower = this.getTotalChargingPower(current);
        const bestPower = this.getTotalChargingPower(best);
        return currentPower > bestPower ? current : best;
      });
    } catch (error) {
      console.error('Error finding charging station:', error);
      return null;
    }
  }

  /**
   * Calculate total charging power of a dock station
   */
  getTotalChargingPower(station) {
    const solar = station.chargingStations?.solar?.currentOutput || 0;
    const wind = station.chargingStations?.wind?.currentOutput || 0;
    const grid = station.chargingStations?.grid?.totalPower || 0;
    
    return solar + wind + grid;
  }

  /**
   * Estimate charging time
   * @param {Number} currentBattery - Current battery percentage
   * @param {Number} targetBattery - Target battery percentage
   * @param {Object} station - Dock station with charging info
   * @returns {Number} Estimated charging time in minutes
   */
  estimateChargingTime(currentBattery, targetBattery, station) {
    const batteryDifference = targetBattery - currentBattery;
    const chargingPower = this.getTotalChargingPower(station);
    
    // Assuming average drone battery capacity of 50kWh
    // and charging efficiency of 85%
    const batteryCapacity = 50; // kWh
    const efficiency = 0.85;
    const requiredEnergy = (batteryDifference / 100) * batteryCapacity;
    
    if (chargingPower === 0) {
      return Infinity;
    }
    
    const chargingTimeHours = requiredEnergy / (chargingPower * efficiency);
    return chargingTimeHours * 60; // Convert to minutes
  }

  /**
   * Monitor solar panel efficiency on drone
   * @param {Object} drone - Drone document
   * @param {Object} weather - Current weather conditions
   * @returns {Number} Solar charging rate in % per hour
   */
  calculateSolarChargingRate(drone, weather = {}) {
    if (!drone.specifications.hasSolarPanels) {
      return 0;
    }

    // Base solar charging rate (optimal conditions)
    let baseRate = 5; // 5% per hour in optimal conditions

    // Adjust for weather conditions
    const cloudCover = weather.cloudCover || 0; // 0-100%
    const sunlight = weather.sunlight || 80; // 0-100%
    
    const weatherFactor = ((100 - cloudCover) / 100) * (sunlight / 100);
    const adjustedRate = baseRate * weatherFactor;

    return Math.max(0, adjustedRate);
  }

  /**
   * Optimize drone allocation based on battery levels
   * @param {Array} availableDrones - List of available drones
   * @param {Number} requiredEnergy - Energy required for trip
   * @returns {Object} Best drone for the trip
   */
  selectOptimalDrone(availableDrones, requiredEnergy) {
    // Filter drones with sufficient battery
    const suitableDrones = availableDrones.filter(drone => {
      return drone.batteryLevel >= requiredEnergy + 15; // 15% safety margin
    });

    if (suitableDrones.length === 0) {
      return null;
    }

    // Sort by battery level (prefer drones with battery closest to required + safety)
    // This helps balance battery usage across fleet
    const optimalBatteryLevel = requiredEnergy + 25; // Ideal: required + 25%
    
    suitableDrones.sort((a, b) => {
      const aDiff = Math.abs(a.batteryLevel - optimalBatteryLevel);
      const bDiff = Math.abs(b.batteryLevel - optimalBatteryLevel);
      return aDiff - bDiff;
    });

    return suitableDrones[0];
  }

  /**
   * Schedule charging for drone
   * @param {String} droneId - Drone ID
   * @param {String} stationId - Dock station ID
   * @returns {Object} Charging schedule
   */
  async scheduleCharging(droneId, stationId) {
    try {
      const drone = await Drone.findById(droneId);
      const station = await DockStation.findById(stationId);

      if (!drone || !station) {
        throw new Error('Drone or station not found');
      }

      const chargingTime = this.estimateChargingTime(
        drone.batteryLevel,
        this.optimalChargeLevel,
        station
      );

      // Update drone status
      drone.status = 'charging';
      drone.currentDockStation = stationId;
      await drone.save();

      // Update station capacity
      station.capacity.available -= 1;
      station.dronesCurrently.push(droneId);
      await station.save();

      return {
        droneId,
        stationId,
        currentBattery: drone.batteryLevel,
        targetBattery: this.optimalChargeLevel,
        estimatedChargingTime: chargingTime,
        estimatedCompletion: new Date(Date.now() + chargingTime * 60000)
      };
    } catch (error) {
      console.error('Error scheduling charging:', error);
      throw error;
    }
  }

  /**
   * Monitor renewable energy generation at stations
   * @param {String} stationId - Dock station ID
   * @returns {Object} Energy generation statistics
   */
  async monitorRenewableEnergy(stationId) {
    const station = await DockStation.findById(stationId);
    
    if (!station) {
      throw new Error('Station not found');
    }

    const solar = station.chargingStations?.solar || {};
    const wind = station.chargingStations?.wind || {};
    
    const totalRenewable = (solar.currentOutput || 0) + (wind.currentOutput || 0);
    const totalCapacity = (solar.totalPower || 0) + (wind.totalPower || 0);
    const efficiency = totalCapacity > 0 ? (totalRenewable / totalCapacity) * 100 : 0;

    return {
      solar: {
        current: solar.currentOutput || 0,
        capacity: solar.totalPower || 0,
        efficiency: solar.totalPower > 0 ? (solar.currentOutput / solar.totalPower) * 100 : 0
      },
      wind: {
        current: wind.currentOutput || 0,
        capacity: wind.totalPower || 0,
        efficiency: wind.totalPower > 0 ? (wind.currentOutput / wind.totalPower) * 100 : 0
      },
      total: {
        current: totalRenewable,
        capacity: totalCapacity,
        efficiency
      },
      timestamp: new Date()
    };
  }
}

module.exports = new EnergyManagementService();
