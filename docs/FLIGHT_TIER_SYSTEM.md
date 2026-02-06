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
# Flight Tier Access System

A comprehensive 4-tier authentication and authorization system for the Drontylity autonomous drone platform.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tier System](#tier-system)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Security Features](#security-features)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

The Flight Tier Access System provides a structured approach to user permissions and service access across the Drontylity platform. It implements:

- **4 distinct user tiers** with specific capabilities
- **3 toggleable services** for subscribers
- **Self-service tier upgrades** (Tier 0 → 1)
- **Admin-controlled promotions** (Tier 2 & 3)
- **Complete audit trail** with timestamps
- **Service isolation** between tiers

## Architecture

### Backend Stack

- **Node.js** + Express.js
- **MongoDB** + Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Express Rate Limit** for API protection

### Frontend Stack

- **React 19** + TypeScript
- **CSS3** for styling
- **i18n** for localization (Czech & English)

### Database Schema

```javascript
{
  platformTier: Number (0-3, default: 0),
  transportPermissions: Map<String, Boolean>,
  onboardingCompletedAt: Date,
  tierNotes: String,
  isAdmin: Boolean
}
```

## Tier System

### Tier 0: Prospective Visitor
- **Purpose:** Marketing and exploration
- **Access:** Read-only platform capabilities
- **Upgrade:** Self-service to Tier 1

### Tier 1: Active Subscriber
- **Purpose:** Full drone transportation services
- **Services:**
  - 🚁 **Route Automation** - AI-powered automated taxi flights
  - ✈️ **Manual Operation** - Self-piloted drone rental (requires license)
  - 📦 **Freight Handling** - Package transport and logistics
- **Control:** Independent toggle for each service

### Tier 2: System Overseer
- **Purpose:** Platform administration
- **Access:**
  - User management
  - System configuration
  - Platform analytics
- **Restrictions:** Cannot access subscriber services

### Tier 3: Technical Crew
- **Purpose:** Fleet maintenance and operations
- **Access:**
  - Diagnostic tools
  - Maintenance protocols
  - Fleet management
- **Restrictions:** Cannot access subscriber services

## Quick Start

### Prerequisites

- Node.js 16+
- MongoDB 5+
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/M1N0-OR1G1NAL/DRONERSHARE_MOBILLITY.git
cd DRONERSHARE_MOBILLITY
```

2. **Backend setup:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

3. **Frontend setup:**
```bash
cd frontend
npm install
npm start
```

### Environment Variables

Create a `.env` file in the backend directory:

```bash
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dronershare
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
```

## API Documentation

Full API documentation is available in [`docs/FLIGHT_TIER_API.md`](../docs/FLIGHT_TIER_API.md).

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user (Tier 0)
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

#### Flight Access
- `GET /api/flight-access` - Get tier dashboard
- `POST /api/flight-access/elevate/:target` - Change tier level
- `POST /api/flight-access/service/:service` - Toggle service
- `GET /api/flight-access/users` - List all users (admin only)

### Usage Example

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+420123456789"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'

# Upgrade to Subscriber (use token from login)
curl -X POST http://localhost:3000/api/flight-access/elevate/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Enable Route Automation
curl -X POST http://localhost:3000/api/flight-access/service/route_automation \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Frontend Components

### FlightAccess Component

Located at `frontend/src/components/FlightAccess/`

**Features:**
- Automatic tier detection and UI rendering
- Service toggle controls for Tier 1
- Admin/tech panels for Tiers 2 & 3
- Responsive design
- Bilingual support (Czech/English)

**Usage in React:**
```tsx
import FlightAccess from './components/FlightAccess/FlightAccess';

function App() {
  return (
    <div>
      <FlightAccess apiUrl="http://localhost:3000" />
    </div>
  );
}
```

### Localization

Translation files in `frontend/src/locales/`:
- `cs.json` - Czech translations
- `en.json` - English translations

## Security Features

### Authentication
- JWT tokens with 7-day expiration
- Bcrypt password hashing (10 rounds)
- HTTP-only cookies (recommended for production)

### Rate Limiting
- **Auth endpoints:** 5 requests per 15 minutes
- **Sensitive operations:** 20 requests per 5 minutes
- **General API:** 100 requests per 15 minutes

### Authorization
- Tier-based access control
- Service-specific permissions
- Admin-only operations
- Self-service restrictions

### Best Practices
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- CORS configuration
- Helmet.js security headers

## Testing

### Unit Tests

```bash
cd backend
npm test
```

### Flight Tier Specific Tests

```bash
npm test -- flightTier.test.js
```

### Test Coverage

The test suite includes:
- User model tier query methods
- Tier elevation workflows
- Service toggle functionality
- API integration tests
- Authentication flows
- Authorization checks

**Note:** Tests require a running MongoDB instance.

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure MongoDB connection string
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure logging (Winston, Morgan)
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable CORS only for trusted domains
- [ ] Set up rate limiting
- [ ] Implement refresh token rotation
- [ ] Add request/response validation

### Docker Deployment

```bash
docker-compose up -d
```

See `docker-compose.yml` for configuration.

### PM2 Process Manager

```bash
pm2 start backend/src/server.js --name dronershare-api
pm2 save
pm2 startup
```

## Database Migration

If upgrading from an existing system without tier fields:

```javascript
// Run this migration script
const User = require('./src/models/User');

async function migrate() {
  const users = await User.find({});
  for (const user of users) {
    if (user.platformTier === undefined) {
      user.platformTier = 0; // Set existing users to Tier 0
      user.transportPermissions = new Map();
      await user.save();
    }
  }
  console.log('Migration complete');
}

migrate();
```

## Troubleshooting

### Common Issues

**Issue:** JWT token expired
**Solution:** Login again to get a new token

**Issue:** Rate limit exceeded
**Solution:** Wait 15 minutes or contact support for IP whitelisting

**Issue:** Service toggle fails
**Solution:** Ensure user is Tier 1 (Active Subscriber)

**Issue:** MongoDB connection failed
**Solution:** Check MONGODB_URI in .env file

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](../LICENSE) file for details.

## Support

For issues or questions:
- Open an issue on GitHub
- See full documentation in `docs/FLIGHT_TIER_API.md`
- Contact: project maintainers

## Changelog

### Version 1.0.0 (2026-02-06)
- Initial implementation of 4-tier system
- User model with tier fields
- Authentication and authorization
- Frontend dashboard components
- Czech and English localization
- Comprehensive API documentation
- Rate limiting security features
- Complete test suite

---

**Built with ❤️ for the future of autonomous drone mobility**
