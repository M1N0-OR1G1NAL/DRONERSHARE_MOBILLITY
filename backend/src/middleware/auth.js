const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware - verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Authorization middleware - check tier permissions
const requireTier = (minTier) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.platformTier < minTier) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredTier: minTier,
        currentTier: req.user.platformTier
      });
    }

    next();
  };
};

// Check if user is subscriber
const requireSubscriber = (req, res, next) => {
  if (!req.user || !req.user.isSubscribedMember()) {
    return res.status(403).json({ 
      error: 'Active Subscriber access required',
      currentTier: req.user?.platformTier || 0
    });
  }
  next();
};

// Check if user is admin (overseer or enterprise)
const requireAdmin = (req, res, next) => {
  if (!req.user || (!req.user.isSystemOverseer() && req.user.userLevel !== 'enterprise')) {
    return res.status(403).json({ 
      error: 'Administrator access required'
    });
  }
  next();
};

module.exports = {
  authenticate,
  requireTier,
  requireSubscriber,
  requireAdmin
/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Attach user ID to request
    req.user = { id: decoded.userId };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Check if user is a subscriber (Tier 1)
 */
exports.requireSubscriber = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.subscribedMember()) {
      return res.status(403).json({ 
        error: 'This feature requires Active Subscriber status (Tier 1)' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Subscriber check error:', error);
    return res.status(500).json({ error: 'Authorization failed' });
  }
};

/**
 * Check if user is a system overseer (Tier 2) or higher
 */
exports.requireOverseer = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.systemOverseer() && user.platformTier !== 3 && !user.isAdmin) {
      return res.status(403).json({ 
        error: 'This feature requires System Overseer privileges' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Overseer check error:', error);
    return res.status(500).json({ error: 'Authorization failed' });
  }
};

/**
 * Check if user has specific service enabled
 */
exports.requireService = (serviceName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      let hasService = false;
      switch(serviceName) {
        case 'route_automation':
          hasService = user.autoTaxiAllowed();
          break;
        case 'manual_operation':
          hasService = user.pilotRentalAllowed();
          break;
        case 'freight_handling':
          hasService = user.cargoLogisticsAllowed();
          break;
      }
      
      if (!hasService) {
        return res.status(403).json({ 
          error: `This feature requires ${serviceName} service to be enabled` 
        });
      }
      
      next();
    } catch (error) {
      console.error('Service check error:', error);
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
};
