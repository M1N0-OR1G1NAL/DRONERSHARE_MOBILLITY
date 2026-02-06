const User = require('../models/User');

/**
 * Flight Access Controller
 * Manages tier elevation and service modifications for the 4-tier flight access system
 */

/**
 * Get dashboard data for current user
 * @route GET /api/flight-access
 */
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const dashboardData = {
      tier: user.platformTier,
      tierDescription: user.tierDescription(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboardingCompletedAt: user.onboardingCompletedAt,
      tierNotes: user.tierNotes
    };

    // Add service permissions for Tier 1 subscribers
    if (user.subscribedMember()) {
      dashboardData.services = {
        route_automation: user.autoTaxiAllowed(),
        manual_operation: user.pilotRentalAllowed(),
        freight_handling: user.cargoLogisticsAllowed()
      };
      dashboardData.enabledServices = user.subscriberServices();
    }

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

/**
 * Elevate user to a different tier
 * @route POST /api/flight-access/elevate/:target
 */
exports.elevateTier = async (req, res) => {
  try {
    const { target } = req.params;
    const targetTier = parseInt(target);

    if (isNaN(targetTier) || targetTier < 0 || targetTier > 3) {
      return res.status(400).json({ error: 'Invalid tier level' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Authorization checks
    // Tier 0 -> 1: Self-service allowed
    if (targetTier === 1 && user.platformTier === 0) {
      await user.elevateToSubscriber();
      return res.json({
        success: true,
        message: 'Successfully upgraded to Active Subscriber',
        tier: user.platformTier,
        tierDescription: user.tierDescription()
      });
    }

    // Tier 2 or 3: Requires admin privileges
    if (targetTier === 2 || targetTier === 3) {
      // Check if requesting user has admin privileges
      // For now, we'll check if they're already tier 2 or have admin flag
      // In production, this should check a proper admin role
      const requestingUser = await User.findById(req.user.id);
      if (requestingUser.platformTier !== 2 && !requestingUser.isAdmin) {
        return res.status(403).json({ 
          error: 'Only System Overseers or Super Admins can promote to administrative tiers' 
        });
      }

      // Get target user if promoting someone else
      const targetUserId = req.body.targetUserId || req.user.id;
      const targetUser = await User.findById(targetUserId);
      
      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      if (targetTier === 2) {
        await targetUser.appointOverseer();
        return res.json({
          success: true,
          message: 'Successfully appointed as System Overseer',
          tier: targetUser.platformTier,
          tierDescription: targetUser.tierDescription()
        });
      } else if (targetTier === 3) {
        await targetUser.assignTechCrew();
        return res.json({
          success: true,
          message: 'Successfully assigned to Technical Crew',
          tier: targetUser.platformTier,
          tierDescription: targetUser.tierDescription()
        });
      }
    }

    return res.status(400).json({ error: 'Invalid tier elevation request' });
  } catch (error) {
    console.error('Tier elevation error:', error);
    res.status(500).json({ error: 'Failed to elevate tier' });
  }
};

/**
 * Toggle a service on/off for Tier 1 subscribers
 * @route POST /api/flight-access/service/:service
 */
exports.toggleService = async (req, res) => {
  try {
    const { service } = req.params;
    
    const validServices = ['route_automation', 'manual_operation', 'freight_handling'];
    if (!validServices.includes(service)) {
      return res.status(400).json({ error: 'Invalid service name' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only Tier 1 subscribers can toggle services
    if (!user.subscribedMember()) {
      return res.status(403).json({ 
        error: 'Service toggles are only available for Active Subscribers (Tier 1)' 
      });
    }

    // Toggle the service
    if (service === 'route_automation') {
      await user.toggleAutoTaxi();
    } else if (service === 'manual_operation') {
      await user.togglePilotRental();
    } else if (service === 'freight_handling') {
      await user.toggleCargoLogistics();
    }

    const serviceNames = {
      'route_automation': 'Route Automation (Auto Taxi)',
      'manual_operation': 'Manual Operation (Pilot Rental)',
      'freight_handling': 'Freight Handling (Cargo Logistics)'
    };

    const isEnabled = user.transportPermissions.get(service);

    res.json({
      success: true,
      message: `${serviceNames[service]} ${isEnabled ? 'enabled' : 'disabled'}`,
      service: service,
      enabled: isEnabled,
      allServices: {
        route_automation: user.autoTaxiAllowed(),
        manual_operation: user.pilotRentalAllowed(),
        freight_handling: user.cargoLogisticsAllowed()
      }
    });
  } catch (error) {
    console.error('Service toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle service' });
  }
};

/**
 * Get all users with their tier information (admin only)
 * @route GET /api/flight-access/users
 */
exports.listUsers = async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user.id);
    
    // Only System Overseers (Tier 2) can view all users
    if (!requestingUser.systemOverseer() && !requestingUser.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const users = await User.find({}, {
      password: 0,
      paymentMethods: 0
    }).sort({ createdAt: -1 });

    const userList = users.map(user => ({
      id: user._id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      tier: user.platformTier,
      tierDescription: user.tierDescription(),
      onboardingCompletedAt: user.onboardingCompletedAt,
      services: user.subscribedMember() ? user.subscriberServices() : [],
      createdAt: user.createdAt
    }));

    res.json(userList);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};
