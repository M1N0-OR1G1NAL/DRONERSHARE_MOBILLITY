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
