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
};
