# Flight Tier System - Technical Documentation

## Overview

The Flight Tier System is a comprehensive 4-phase authentication and authorization framework designed for the Drontylity autonomous drone transportation platform. It provides granular access control for different user types while maintaining security and flexibility.

## Architecture

### Component Structure

```
Drontylity Flight Tier System
├── Models
│   ├── Locomotive::Account (Mongoid Document)
│   └── Locomotive::Concerns::Account::FlightTierSystem (Concern)
├── Controllers
│   └── Locomotive::FlightAccessController
├── Views
│   ├── flight_access/dashboard.html.slim
│   └── shared/account/_navigation.html.slim
├── Locales
│   ├── flight_access.cs.yml (Czech)
│   └── flight_access.en.yml (English)
└── Routes
    └── config/routes.rb (Flight Access routes)
```

## Tier Hierarchy

### Tier 0: Prospective Visitor (Neregistrovaný uživatel)
- **Purpose**: Marketing and information browsing
- **Access**: Read-only access to platform information
- **Restrictions**: Cannot use any transportation services
- **Elevation**: Self-service upgrade to Tier 1

### Tier 1: Active Subscriber (Registrovaný uživatel)
- **Purpose**: Full access to drone transportation services
- **Access**: Three independent services (can be toggled individually)
  - Route Automation (Automated taxi ride)
  - Manual Operation (Personal drone rental)
  - Freight Handling (Package transport/logistics)
- **Restrictions**: Cannot access administrative functions
- **Elevation**: Requires super_admin authorization for Tier 2/3

### Tier 2: System Overseer (Administrátor)
- **Purpose**: Platform administration
- **Access**: User management, system settings, platform metrics
- **Restrictions**: Cannot use subscriber transportation services
- **Elevation**: Only from Tier 0/1 by super_admin

### Tier 3: Technical Crew (Správce/Údržbář)
- **Purpose**: Fleet maintenance and technical operations
- **Access**: Diagnostics, maintenance scheduling, technical logs
- **Restrictions**: Cannot use subscriber transportation services
- **Elevation**: Only from Tier 0/1 by super_admin

## Database Schema

### Account Model Fields

```ruby
field :platform_tier, type: Integer, default: 0
# Values: 0 (Visitor), 1 (Subscriber), 2 (Overseer), 3 (Tech Crew)

field :transport_permissions, type: Hash, default: {}
# Structure for Tier 1 only:
# {
#   'route_automation' => boolean,   # Service A
#   'manual_operation' => boolean,   # Service B
#   'freight_handling' => boolean    # Service C
# }

field :onboarding_completed_at, type: Time
# Timestamp when user upgraded to Tier 1

field :tier_notes, type: String
# Optional administrative notes about tier status
```

## API Reference

### FlightTierSystem Concern Methods

#### Tier Check Methods
```ruby
account.prospective_visitor?    # => true/false
account.active_subscriber?      # => true/false
account.system_overseer?        # => true/false
account.technical_crew?         # => true/false
account.administrative_tier?    # => true/false (Tier 2 or 3)
```

#### Service Permission Checkers
```ruby
account.auto_taxi_allowed?        # => true/false
account.pilot_rental_allowed?     # => true/false
account.cargo_logistics_allowed?  # => true/false
```

#### Tier Elevation Methods
```ruby
account.elevate_to_subscriber!  # Tier 0 -> Tier 1
account.appoint_overseer!       # Tier 0/1 -> Tier 2
account.assign_tech_crew!       # Tier 0/1 -> Tier 3
account.demote_to_visitor!      # Any tier -> Tier 0
```

#### Service Toggle Methods
```ruby
account.toggle_auto_taxi         # Returns new state (true/false)
account.toggle_pilot_rental      # Returns new state (true/false)
account.toggle_cargo_logistics   # Returns new state (true/false)
```

#### Display Methods
```ruby
account.tier_name         # English tier name
account.tier_name_czech   # Czech tier name
```

### Controller Endpoints

#### GET /flight-access
Displays the Flight Access dashboard with tier-specific content.

**Response Formats**: HTML, JSON

**JSON Response Example**:
```json
{
  "tier_info": {
    "current_tier": 1,
    "tier_name": "Active Subscriber",
    "tier_name_czech": "Registrovaný uživatel",
    "can_subscribe": false,
    "can_manage_services": true,
    "is_admin": false
  },
  "services": {
    "route_automation": true,
    "manual_operation": false,
    "freight_handling": true
  }
}
```

#### POST /flight-access/elevate/:target
Elevates account to specified tier.

**Parameters**:
- `target`: "subscriber", "overseer", "tech_crew", or "visitor"

**Authorization**:
- "subscriber": Self-service from Tier 0
- "overseer", "tech_crew": Requires super_admin
- "visitor": Any tier can demote

**Response**: Redirect with flash message or JSON success/error

#### POST /flight-access/service/:service
Toggles specified service on/off.

**Parameters**:
- `service`: "auto_taxi", "pilot_rental", or "cargo_logistics"

**Authorization**: Only for Tier 1 (Active Subscriber)

**Response**: JSON with new state or error

## Security Model

### Access Control Rules

1. **Tier Elevation**
   - Users can self-upgrade from Tier 0 to Tier 1
   - Only super_admin can assign Tier 2 or Tier 3
   - Administrative tiers cannot access subscriber services

2. **Service Isolation**
   - Transportation services exclusive to Tier 1
   - Administrative functions exclusive to Tier 2/3
   - Clear separation prevents privilege escalation

3. **Permission Validation**
   - All tier changes validated before execution
   - Service toggles only work for appropriate tier
   - Database constraints enforce tier values

4. **Audit Trail**
   - `onboarding_completed_at` tracks subscription activation
   - `tier_notes` field for administrative logging
   - Tier changes can be logged via callbacks

### Protection Mechanisms

```ruby
# Example: Preventing invalid tier assignments
validates :platform_tier, inclusion: { 
  in: [TIER_PROSPECTIVE_VISITOR, TIER_ACTIVE_SUBSCRIBER, 
       TIER_SYSTEM_OVERSEER, TIER_TECHNICAL_CREW],
  message: "must be a valid tier level"
}

# Example: Service isolation for administrative tiers
def toggle_auto_taxi
  return false unless active_subscriber?
  toggle_service('route_automation')
end
```

## Integration Guide

### Adding to Existing LocomotiveCMS Installation

1. **Copy Model Files**
   ```bash
   cp app/models/locomotive/concerns/account/flight_tier_system.rb YOUR_APP/
   ```

2. **Update Account Model**
   ```ruby
   module Locomotive
     class Account
       include Locomotive::Concerns::Account::FlightTierSystem
       # ... existing code ...
     end
   end
   ```

3. **Add Routes**
   ```ruby
   # config/routes.rb
   namespace :locomotive do
     get 'flight-access', to: 'flight_access#dashboard', as: :flight_access
     post 'flight-access/elevate/:target', to: 'flight_access#elevate'
     post 'flight-access/service/:service', to: 'flight_access#toggle_service'
   end
   ```

4. **Copy Localization Files**
   ```bash
   cp config/locales/flight_access.*.yml YOUR_APP/config/locales/
   ```

5. **Run Migrations** (if needed)
   ```ruby
   # In Mongoid, fields are added dynamically, no migration needed
   # For ActiveRecord, create migration:
   rails generate migration AddFlightTierToAccounts \
     platform_tier:integer \
     transport_permissions:jsonb \
     onboarding_completed_at:datetime \
     tier_notes:text
   ```

### Console Usage Examples

```ruby
# Create and upgrade account
account = Locomotive::Account.create!(
  email: 'user@example.com', 
  name: 'Jan Novák', 
  password: 'secure123'
)

# Upgrade to subscriber
account.elevate_to_subscriber!

# Enable services
account.toggle_auto_taxi         # Activate automated taxi
account.toggle_pilot_rental      # Activate drone rental
account.toggle_cargo_logistics   # Activate cargo delivery

# Check permissions
account.auto_taxi_allowed?  # => true

# Administrative actions (requires super_admin)
admin = Locomotive::Account.find_by(super_admin: true)
admin.appoint_overseer!  # Make admin an overseer

# Promote another user
user = Locomotive::Account.find_by_email('operator@example.com')
user.assign_tech_crew!  # Make them maintenance crew
```

## Internationalization

The system supports Czech (primary) and English translations:

### Adding New Languages

1. Create new locale file: `config/locales/flight_access.XX.yml`
2. Copy structure from `flight_access.en.yml`
3. Translate all strings
4. System automatically uses account's locale setting

### Locale Keys Structure

```yaml
XX:
  flight_access:
    dashboard_title: "..."
    services:
      auto_taxi:
        name: "..."
        description: "..."
      pilot_rental:
        name: "..."
        description: "..."
      cargo_logistics:
        name: "..."
        description: "..."
```

## Testing

### RSpec Test Coverage

The test suite provides comprehensive coverage with 16 examples:

- Tier constants validation
- Default state verification
- Tier elevation scenarios
- Service toggle functionality
- Permission restrictions
- Internationalization
- Administrative tier checks

### Running Tests

```bash
# Run all Flight Tier System tests
rspec spec/models/locomotive/concerns/account/flight_tier_system_spec.rb

# Run specific test group
rspec spec/models/locomotive/concerns/account/flight_tier_system_spec.rb -e "service toggles"
```

## Performance Considerations

1. **Database Queries**
   - Tier checks are simple integer comparisons (fast)
   - Service checks involve Hash lookups (O(1) complexity)
   - No N+1 queries in dashboard rendering

2. **Caching Opportunities**
   - Tier information can be cached per session
   - Service permissions can be memoized
   - Dashboard data suitable for fragment caching

3. **Optimization Tips**
   ```ruby
   # Eager load accounts with tier info
   Locomotive::Account.where(platform_tier: 1).only(
     :platform_tier, :transport_permissions, :email, :name
   )
   ```

## Future Enhancements

### Planned Features

1. **Tariff Plans**
   - Sub-tiers within Tier 1 for pricing
   - Bronze, Silver, Gold subscriber levels
   - Usage limits per plan

2. **Usage Analytics**
   - Track service usage per account
   - Generate usage reports
   - Billing integration

3. **Admin Dashboard**
   - Dedicated UI for Tier 2 overseers
   - User management interface
   - Platform statistics

4. **Maintenance Panel**
   - Specialized interface for Tier 3
   - Fleet diagnostics
   - Maintenance scheduling

5. **Email Notifications**
   - Tier change notifications
   - Service activation alerts
   - Welcome emails for new subscribers

6. **API Expansion**
   - RESTful API for mobile apps
   - GraphQL support
   - Webhook integrations

## Troubleshooting

### Common Issues

**Q: Service toggles not working**
A: Ensure account is Tier 1 (Active Subscriber). Administrative tiers cannot toggle services.

**Q: Cannot elevate to administrative tier**
A: Only super_admin accounts can promote users to Tier 2/3. Check super_admin flag.

**Q: Permissions not persisting**
A: Verify save! is called after toggle. Check for validation errors.

**Q: Locale not displaying correctly**
A: Ensure account.locale is set to 'cs' or 'en'. Check I18n fallbacks configuration.

## Support and Maintenance

- **Documentation**: FLIGHT_TIER_SYSTEM.md (this file)
- **Testing Guide**: TESTING_GUIDE.md
- **Implementation Summary**: IMPLEMENTATION_SUMMARY.md
- **Issues**: Report via GitHub issues

## License and Attribution

This Flight Tier System is part of the Drontylity platform and follows the same license as the main project.

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-06  
**Compatibility**: Rails 7.1+, Mongoid 8.0+, Devise 4.9+
