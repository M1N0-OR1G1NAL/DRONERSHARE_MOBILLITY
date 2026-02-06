# Drontylity LocomotiveCMS Engine - Flight Tier System

This directory contains the LocomotiveCMS engine implementation for the Drontylity 4-phase authentication and authorization system.

## What's Included

This Rails engine provides a complete tier-based access control system specifically designed for the Drontylity autonomous drone platform.

### Components

- **Models**: Account model with FlightTierSystem concern
- **Controllers**: FlightAccessController for tier and service management
- **Views**: Responsive dashboard with tier-specific UI
- **Locales**: Czech and English translations
- **Routes**: Flight access endpoints
- **Tests**: Comprehensive RSpec test suite

## Quick Start

### Installation

The engine is already integrated into the Drontylity platform. All necessary files are located in:

```
app/
├── models/locomotive/
├── controllers/locomotive/
└── views/locomotive/

config/
├── locales/
└── routes.rb

spec/
└── models/locomotive/
```

### Usage

See the detailed documentation:

- **[FLIGHT_TIER_SYSTEM.md](../FLIGHT_TIER_SYSTEM.md)** - Technical documentation
- **[TESTING_GUIDE.md](../TESTING_GUIDE.md)** - Testing procedures
- **[IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)** - Implementation overview

## Tier Structure

1. **Tier 0: Prospective Visitor** - Browse and explore
2. **Tier 1: Active Subscriber** - Full service access
3. **Tier 2: System Overseer** - Platform administration
4. **Tier 3: Technical Crew** - Fleet maintenance

## Features

✅ 4-phase authentication system  
✅ 3 independent subscriber services  
✅ Self-service tier upgrades  
✅ Bilingual support (Czech/English)  
✅ Permission-based access control  
✅ Comprehensive test coverage  

## Files Overview

### Models
- `app/models/locomotive/account.rb` - Main account model
- `app/models/locomotive/concerns/account/flight_tier_system.rb` - Tier system logic (179 lines)

### Controllers
- `app/controllers/locomotive/flight_access_controller.rb` - Dashboard and API endpoints (119 lines)

### Views
- `app/views/locomotive/flight_access/dashboard.html.slim` - Main dashboard UI (248 lines)
- `app/views/locomotive/shared/account/_navigation.html.slim` - Navigation menu

### Configuration
- `config/routes.rb` - Flight access routes
- `config/locales/flight_access.cs.yml` - Czech translations
- `config/locales/flight_access.en.yml` - English translations
- `config/locales/cs.yml` - Czech navigation
- `config/locales/en.yml` - English navigation

### Tests
- `spec/models/locomotive/concerns/account/flight_tier_system_spec.rb` - 16 test examples

## Development

This is a Mongoid-based system designed for LocomotiveCMS. It assumes:
- Rails 7.1+
- Mongoid 8.0+
- Devise 4.9+

## License

Part of the Drontylity platform - see main repository LICENSE.
