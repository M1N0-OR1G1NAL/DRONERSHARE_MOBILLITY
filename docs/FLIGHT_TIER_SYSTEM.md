# Flight Tier System - Technical Documentation

## Overview

The Flight Tier System implements a 4-phase user access control system for the DroneShare Mobility platform, based on the Czech requirements:

1. **Fáze 1: Registrovaný uživatel** (Tier 1 - Active Subscriber)
2. **Fáze 2: Neregistrovaný uživatel** (Tier 0 - Prospective Visitor)
3. **Fáze 3: ADMINISTRATOR** (Tier 2 - System Overseer)
4. **Fáze 4: SPRÁVCE/ÚDRŽBÁŘ** (Tier 3 - Technical Crew)

## Architecture

### Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Testing**: Jest with Supertest

### Database Schema

#### User Model Extensions

```javascript
{
  // Existing fields
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  pilotLicense: Object,
  paymentMethods: Array,
  userLevel: String, // 'basic', 'premium', 'enterprise'
  
  // New tier system fields
  platformTier: Number,  // 0-3
  transportPermissions: {
    routeAutomation: Boolean,   // Service a: Automated taxi
    manualOperation: Boolean,   // Service b: Drone rental
    freightHandling: Boolean    // Service c: Package logistics
  },
  onboardingCompletedAt: Date,
  tierNotes: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Tier Definitions

### Tier 0: Prospective Visitor
- **Purpose**: Browse-only access, marketing content
- **Initial State**: All new registrations start here
- **Permissions**: View public information
- **Transition**: Self-upgrade to Tier 1

### Tier 1: Active Subscriber
- **Purpose**: Full service access with 3 independent toggles
- **Services**:
  - **a) Automated Taxi** (`routeAutomation`): Autonomous transport A→B
  - **b) Drone Rental** (`manualOperation`): Personal piloting
  - **c) Cargo Logistics** (`freightHandling`): Package transport
- **Transition**: Requires admin for higher tiers

### Tier 2: System Overseer
- **Purpose**: Platform administration
- **Permissions**: Manage users, appoint overseers, assign tech crew
- **Restrictions**: Cannot use subscriber services
- **Transition**: Requires super_admin or existing overseer

### Tier 3: Technical Crew
- **Purpose**: Maintenance and diagnostics
- **Permissions**: Fleet management, diagnostics
- **Restrictions**: Cannot use subscriber services
- **Transition**: Requires super_admin or overseer

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Body: {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string
}
Response: {
  user: { id, email, firstName, lastName, platformTier, tierDescription },
  token: string
}
```

#### Login
```
POST /api/auth/login
Body: { email: string, password: string }
Response: {
  user: { id, email, firstName, lastName, platformTier, tierDescription, subscriberServices },
  token: string
}
```

#### Get Profile
```
GET /api/auth/profile
Headers: { Authorization: "Bearer <token>" }
Response: {
  user: { all user fields, tierDescription, subscriberServices }
}
```

#### Logout
```
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { message: "Logout successful" }
```

### Flight Access

#### Get Dashboard
```
GET /api/flight-access/dashboard
Headers: { Authorization: "Bearer <token>" }
Response: {
  tier: { level, description, onboardingCompletedAt },
  permissions: { isBrowsingProspect, isSubscribedMember, isSystemOverseer, isTechCrew },
  services: { autoTaxi, pilotRental, cargoLogistics } | null,
  transportPermissions: { routeAutomation, manualOperation, freightHandling } | null
}
```

#### Elevate Tier
```
POST /api/flight-access/elevate/:target
Headers: { Authorization: "Bearer <token>" }
Params: target = "subscriber" | "overseer" | "tech-crew"
Body (for overseer/tech-crew): { userId: string }
Response: {
  message: string,
  user: { id, email, platformTier, tierDescription, onboardingCompletedAt }
}
```

#### Toggle Service
```
POST /api/flight-access/service/:service
Headers: { Authorization: "Bearer <token>" }
Params: service = "auto-taxi" | "pilot-rental" | "cargo-logistics"
Response: {
  message: string,
  services: { autoTaxi, pilotRental, cargoLogistics },
  transportPermissions: { routeAutomation, manualOperation, freightHandling }
}
```

## User Model Methods

### Tier Check Methods
- `isBrowsingProspect()`: Returns true if platformTier === 0
- `isSubscribedMember()`: Returns true if platformTier === 1
- `isSystemOverseer()`: Returns true if platformTier === 2
- `isTechCrew()`: Returns true if platformTier === 3

### Tier Elevation Methods
- `elevateToSubscriber()`: Tier 0 → Tier 1 (self-upgrade)
- `appointOverseer(adminUser)`: Any tier → Tier 2 (requires admin)
- `assignTechCrew(adminUser)`: Any tier → Tier 3 (requires admin)

### Service Toggle Methods (Tier 1 only)
- `toggleAutoTaxi()`: Toggle automated taxi service
- `togglePilotRental()`: Toggle drone rental service
- `toggleCargoLogistics()`: Toggle cargo logistics service

### Service Check Methods
- `autoTaxiAllowed()`: Check if auto taxi is enabled
- `pilotRentalAllowed()`: Check if pilot rental is enabled
- `cargoLogisticsAllowed()`: Check if cargo logistics is enabled

### Helper Methods
- `getTierDescription()`: Returns human-readable tier name
- `getSubscriberServices()`: Returns service status object (Tier 1 only)

## Middleware

### Authentication Middleware
- `authenticate`: Verifies JWT token and attaches user to req.user
- `requireTier(minTier)`: Ensures user has minimum tier level
- `requireSubscriber`: Ensures user is Active Subscriber (Tier 1)
- `requireAdmin`: Ensures user is admin (overseer or enterprise)

## Security Considerations

1. **Password Security**: Passwords hashed with bcrypt (10 rounds)
2. **JWT Tokens**: 7-day expiration, signed with secret key
3. **Authorization Checks**: All protected routes verify authentication
4. **Tier Restrictions**: Service access validated at model and API level
5. **Admin Operations**: Tier elevation to 2/3 requires admin verification

## Testing

### Test Coverage
- **Model Tests**: 20+ test cases covering all tier methods
- **API Tests**: 25+ test cases covering all endpoints
- **Coverage**: Controllers, models, middleware, routes

### Running Tests
```bash
cd backend
npm test
npm test -- --coverage
npm test -- flightTierSystem.test.js
npm test -- flightAccessAPI.test.js
```

## Localization

Supported languages:
- **Czech (cs)**: Primary language
- **English (en)**: Secondary language

Localization files: `backend/locales/{cs,en}.json`

## Error Handling

### Common Error Codes
- `401`: Authentication required / Invalid token
- `403`: Insufficient permissions / Wrong tier
- `400`: Validation error / Invalid request
- `404`: Resource not found
- `500`: Server error

## Future Enhancements

1. **Email Verification**: Require email confirmation on registration
2. **Two-Factor Authentication**: Optional 2FA for admin accounts
3. **Audit Logs**: Track tier changes and service toggles
4. **Service Usage Metrics**: Monitor service utilization per user
5. **Tier Expiration**: Time-limited subscriptions
6. **Payment Integration**: Stripe/PayPal for subscription payments
7. **Rate Limiting**: Prevent API abuse
8. **WebSocket Support**: Real-time tier/service updates

## Deployment

### Environment Variables
```
MONGODB_URI=mongodb://localhost:27017/dronershare
JWT_SECRET=your-secret-key-here
NODE_ENV=production
PORT=3000
```

### Database Indexes
```javascript
User.createIndex({ email: 1 });
User.createIndex({ platformTier: 1 });
```

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure MongoDB connection string
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable MongoDB replica sets for transactions
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## Support

For technical issues or questions:
- Create an issue on GitHub
- Consult API documentation
- Review test cases for usage examples
