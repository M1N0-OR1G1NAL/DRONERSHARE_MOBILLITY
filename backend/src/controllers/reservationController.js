const Reservation = require('../models/Reservation');
const Drone = require('../models/Drone');
const routeOptimization = require('../services/routeOptimization');
const energyManagement = require('../services/energyManagement');

class ReservationController {
  /**
   * Create a new drone reservation
   */
  async createReservation(req, res) {
    try {
      const {
        startLocation,
        endLocation,
        serviceLevel,
        pickupType,
        scheduledTime,
        payload
      } = req.body;

      const userId = req.user.id; // From auth middleware

      // Calculate optimal route
      const route = await routeOptimization.calculateOptimalRoute(
        startLocation,
        endLocation,
        { payload }
      );

      // Check legislative restrictions
      const legislative = await routeOptimization.checkLegislativeRestrictions(
        startLocation,
        endLocation
      );

      if (!legislative.allowed) {
        return res.status(400).json({
          error: 'Route not allowed due to legislative restrictions',
          restrictions: legislative.restrictions
        });
      }

      // Find available drones
      const availableDrones = await Drone.find({
        status: 'available',
        serviceLevel: serviceLevel,
        'specifications.maxRange': { $gte: route.distance }
      });

      if (availableDrones.length === 0) {
        return res.status(404).json({
          error: 'No available drones for this route'
        });
      }

      // Select optimal drone based on battery
      const selectedDrone = energyManagement.selectOptimalDrone(
        availableDrones,
        route.energyRequired
      );

      if (!selectedDrone) {
        return res.status(400).json({
          error: 'No drones with sufficient battery for this route',
          message: 'Please try again later or choose a shorter route'
        });
      }

      // Calculate estimated cost (simple pricing model)
      const baseCostPerKm = 50; // CZK per km
      const levelMultiplier = { level1: 1, level2: 1.3, level3: 1.5 };
      const estimatedCost = Math.ceil(
        route.distance * baseCostPerKm * levelMultiplier[serviceLevel]
      );

      // Create reservation
      const reservation = new Reservation({
        user: userId,
        drone: selectedDrone._id,
        serviceLevel,
        startLocation: {
          type: 'Point',
          coordinates: [startLocation.lng, startLocation.lat],
          address: startLocation.address
        },
        endLocation: {
          type: 'Point',
          coordinates: [endLocation.lng, endLocation.lat],
          address: endLocation.address
        },
        pickupType,
        route: {
          distance: route.distance,
          estimatedDuration: route.estimatedDuration,
          waypoints: route.waypoints.map(wp => [wp.lng, wp.lat]),
          optimizedPath: JSON.stringify(route)
        },
        scheduledTime: scheduledTime || new Date(),
        estimatedCost,
        legislativeCheck: {
          passed: true,
          restrictions: legislative.restrictions,
          checkedAt: new Date()
        }
      });

      await reservation.save();

      // Update drone status
      selectedDrone.status = 'in_use';
      await selectedDrone.save();

      res.status(201).json({
        reservation,
        route,
        drone: {
          id: selectedDrone._id,
          model: selectedDrone.model,
          batteryLevel: selectedDrone.batteryLevel
        }
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ error: 'Failed to create reservation' });
    }
  }

  /**
   * Get reservation by ID
   */
  async getReservation(req, res) {
    try {
      const { id } = req.params;
      const reservation = await Reservation.findById(id)
        .populate('user', 'firstName lastName email')
        .populate('drone');

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Check if user owns this reservation
      if (reservation.user._id.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(reservation);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      res.status(500).json({ error: 'Failed to fetch reservation' });
    }
  }

  /**
   * Get user's reservations
   */
  async getUserReservations(req, res) {
    try {
      const userId = req.user.id;
      const { status, limit = 10, page = 1 } = req.query;

      const query = { user: userId };
      if (status) {
        query.status = status;
      }

      const reservations = await Reservation.find(query)
        .populate('drone', 'model manufacturer batteryLevel')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Reservation.countDocuments(query);

      res.json({
        reservations,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  }

  /**
   * Upload pre-flight photos (for level 3 sharing)
   */
  async uploadPreFlightPhotos(req, res) {
    try {
      const { id } = req.params;
      const { photos } = req.body; // Array of photo URLs

      const reservation = await Reservation.findById(id);

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      if (reservation.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      reservation.preFlightPhotos = photos.map(url => ({
        url,
        timestamp: new Date(),
        verified: false
      }));

      await reservation.save();

      res.json({ message: 'Pre-flight photos uploaded', reservation });
    } catch (error) {
      console.error('Error uploading pre-flight photos:', error);
      res.status(500).json({ error: 'Failed to upload photos' });
    }
  }

  /**
   * Upload post-flight photos (for level 3 sharing)
   */
  async uploadPostFlightPhotos(req, res) {
    try {
      const { id } = req.params;
      const { photos } = req.body;

      const reservation = await Reservation.findById(id);

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      if (reservation.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      reservation.postFlightPhotos = photos.map(url => ({
        url,
        timestamp: new Date(),
        verified: false
      }));

      reservation.status = 'completed';
      reservation.actualEndTime = new Date();

      await reservation.save();

      res.json({ message: 'Post-flight photos uploaded', reservation });
    } catch (error) {
      console.error('Error uploading post-flight photos:', error);
      res.status(500).json({ error: 'Failed to upload photos' });
    }
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(req, res) {
    try {
      const { id } = req.params;

      const reservation = await Reservation.findById(id);

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      if (reservation.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (reservation.status === 'in_progress') {
        return res.status(400).json({
          error: 'Cannot cancel reservation in progress'
        });
      }

      reservation.status = 'cancelled';
      await reservation.save();

      // Update drone status back to available
      await Drone.findByIdAndUpdate(reservation.drone, {
        status: 'available'
      });

      res.json({ message: 'Reservation cancelled', reservation });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ error: 'Failed to cancel reservation' });
    }
  }
}

module.exports = new ReservationController();
