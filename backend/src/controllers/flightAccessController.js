const User = require('../models/User');

// Get flight access dashboard data
const getDashboard = async (req, res) => {
  try {
    const user = req.user;

    const dashboardData = {
      tier: {
        level: user.platformTier,
        description: user.getTierDescription(),
        onboardingCompletedAt: user.onboardingCompletedAt
      },
      permissions: {
        isBrowsingProspect: user.isBrowsingProspect(),
        isSubscribedMember: user.isSubscribedMember(),
        isSystemOverseer: user.isSystemOverseer(),
        isTechCrew: user.isTechCrew()
      },
      services: user.getSubscriberServices(),
      transportPermissions: user.isSubscribedMember() ? user.transportPermissions : null
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Elevate user tier
const elevateTier = async (req, res) => {
  try {
    const { target } = req.params;
    const user = req.user;
    const adminUser = req.user; // For admin operations

    switch (target) {
      case 'subscriber':
        // Self-upgrade from Tier 0 to Tier 1
        if (!user.isBrowsingProspect()) {
          return res.status(400).json({ 
            error: 'Can only upgrade to subscriber from Prospective Visitor tier' 
          });
        }
        await user.elevateToSubscriber();
        break;

      case 'overseer':
        // Requires admin permissions
        if (!adminUser.isSystemOverseer() && adminUser.userLevel !== 'enterprise') {
          return res.status(403).json({ 
            error: 'Only super_admin or overseer can appoint overseer' 
          });
        }
        const targetUserId = req.body.userId;
        if (!targetUserId) {
          return res.status(400).json({ error: 'userId required in request body' });
        }
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
          return res.status(404).json({ error: 'Target user not found' });
        }
        await targetUser.appointOverseer(adminUser);
        return res.json({
          message: 'User appointed as System Overseer',
          user: {
            id: targetUser._id,
            email: targetUser.email,
            platformTier: targetUser.platformTier,
            tierDescription: targetUser.getTierDescription()
          }
        });

      case 'tech-crew':
        // Requires admin permissions
        if (!adminUser.isSystemOverseer() && adminUser.userLevel !== 'enterprise') {
          return res.status(403).json({ 
            error: 'Only super_admin or overseer can assign tech crew' 
          });
        }
        const techUserId = req.body.userId;
        if (!techUserId) {
          return res.status(400).json({ error: 'userId required in request body' });
        }
        const techUser = await User.findById(techUserId);
        if (!techUser) {
          return res.status(404).json({ error: 'Target user not found' });
        }
        await techUser.assignTechCrew(adminUser);
        return res.json({
          message: 'User assigned as Technical Crew',
          user: {
            id: techUser._id,
            email: techUser.email,
            platformTier: techUser.platformTier,
            tierDescription: techUser.getTierDescription()
          }
        });

      default:
        return res.status(400).json({ error: 'Invalid target tier' });
    }

    res.json({
      message: 'Tier elevation successful',
      user: {
        id: user._id,
        email: user.email,
        platformTier: user.platformTier,
        tierDescription: user.getTierDescription(),
        onboardingCompletedAt: user.onboardingCompletedAt
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Toggle service (for subscribers only)
const toggleService = async (req, res) => {
  try {
    const { service } = req.params;
    const user = req.user;

    if (!user.isSubscribedMember()) {
      return res.status(403).json({ 
        error: 'Only Active Subscribers can toggle services' 
      });
    }

    switch (service) {
      case 'auto-taxi':
        await user.toggleAutoTaxi();
        break;
      case 'pilot-rental':
        await user.togglePilotRental();
        break;
      case 'cargo-logistics':
        await user.toggleCargoLogistics();
        break;
      default:
        return res.status(400).json({ error: 'Invalid service name' });
    }

    res.json({
      message: 'Service toggled successfully',
      services: user.getSubscriberServices(),
      transportPermissions: user.transportPermissions
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  elevateTier,
  toggleService
};
