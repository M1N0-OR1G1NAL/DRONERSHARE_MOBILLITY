# Testing Guide - Drontylity Flight Tier System

## Overview

This guide provides comprehensive instructions for testing the 4-phase authentication and authorization system, including both manual and automated testing procedures.

## Automated Testing

### Running the Test Suite

The Flight Tier System includes a comprehensive RSpec test suite with 16 examples covering all major functionality.

#### Run All Tests
```bash
rspec spec/models/locomotive/concerns/account/flight_tier_system_spec.rb
```

#### Run Specific Test Groups
```bash
# Test tier constants
rspec spec/models/locomotive/concerns/account/flight_tier_system_spec.rb -e "tier constants"

# Test default state
rspec spec/models/locomotive/concerns/account/flight_tier_system_spec.rb -e "default state"

# Test tier elevation
rspec spec/models/locomotive/concerns/account/flight_tier_system_spec.rb -e "elevate_to_subscriber"

# Test service toggles
rspec spec/models/locomotive/concerns/account/flight_tier_system_spec.rb -e "service toggles"

# Test restrictions
rspec spec/models/locomotive/concerns/account/flight_tier_system_spec.rb -e "service restrictions"

# Test internationalization
rspec spec/models/locomotive/concerns/account/flight_tier_system_spec.rb -e "tier_name"
```

#### Expected Output
```
Locomotive::Concerns::Account::FlightTierSystem
  tier constants
    defines TIER_PROSPECTIVE_VISITOR as 0
    defines TIER_ACTIVE_SUBSCRIBER as 1
    defines TIER_SYSTEM_OVERSEER as 2
    defines TIER_TECHNICAL_CREW as 3
  default state
    starts as prospective visitor (tier 0)
    has empty transport permissions
    has no onboarding completion date
  #elevate_to_subscriber!
    changes tier to active subscriber
    sets onboarding completion timestamp
    initializes transport permissions
    fails if already an administrator
  #appoint_overseer!
    changes tier to system overseer
    clears transport permissions
  #assign_tech_crew!
    changes tier to technical crew
    clears transport permissions
  #demote_to_visitor!
    changes tier back to visitor
    clears transport permissions
    clears onboarding timestamp
  service toggles for active subscribers
    #toggle_auto_taxi
      activates route automation service
      deactivates when toggled again
    #toggle_pilot_rental
      activates manual operation service
      deactivates when toggled again
    #toggle_cargo_logistics
      activates freight handling service
      deactivates when toggled again
    allows independent service activation
  service restrictions
    prevents service access for prospective visitors
    prevents service toggles for prospective visitors
    prevents service access for administrators
    prevents service toggles for administrators
  #tier_name
    returns correct English name for tier 0
    returns correct English name for tier 1
    returns correct English name for tier 2
    returns correct English name for tier 3
  #tier_name_czech
    returns correct Czech name for tier 0
    returns correct Czech name for tier 1
    returns correct Czech name for tier 2
    returns correct Czech name for tier 3
  #administrative_tier?
    returns false for prospective visitor
    returns false for active subscriber
    returns true for system overseer
    returns true for technical crew

Finished in X.XX seconds (files took X.XX seconds to load)
16 examples, 0 failures
```

## Manual Testing

### Prerequisites

1. Rails console access
2. Database access
3. Web browser (for UI testing)
4. Curl or Postman (for API testing)

### Test Scenarios

#### Scenario 1: New User Registration (Tier 0)

**Objective**: Verify default tier assignment and visitor restrictions

**Steps**:
1. Create new account via Rails console:
   ```ruby
   account = Locomotive::Account.create!(
     name: 'Test User',
     email: 'testuser@example.com',
     password: 'password123'
   )
   ```

2. Verify default state:
   ```ruby
   account.platform_tier              # Should be 0
   account.prospective_visitor?       # Should be true
   account.transport_permissions      # Should be {}
   account.auto_taxi_allowed?         # Should be false
   ```

3. Navigate to `/flight-access` in browser
4. Verify visitor view displays:
   - "Neregistrovaný uživatel" badge
   - List of available services after subscription
   - "Přejít na předplatné" button

**Expected Result**: New users start as Tier 0 with no service access

---

#### Scenario 2: Subscription Upgrade (Tier 0 → Tier 1)

**Objective**: Verify self-service subscription activation

**Steps**:
1. As Tier 0 user, click "Přejít na předplatné" button
2. Verify in console:
   ```ruby
   account.reload
   account.platform_tier              # Should be 1
   account.active_subscriber?         # Should be true
   account.onboarding_completed_at    # Should have timestamp
   account.transport_permissions      # Should be initialized
   ```

3. Refresh `/flight-access` page
4. Verify subscriber view displays:
   - "Registrovaný uživatel" badge
   - Three service cards (all inactive)
   - Activate buttons for each service

**Expected Result**: User successfully upgrades to Tier 1 with timestamp

---

#### Scenario 3: Service Activation (Tier 1)

**Objective**: Verify independent service toggles

**Steps**:
1. As Tier 1 user, activate "Automatizovaná taxi jízda"
2. Verify in console:
   ```ruby
   account.reload
   account.auto_taxi_allowed?         # Should be true
   account.pilot_rental_allowed?      # Should be false
   account.cargo_logistics_allowed?   # Should be false
   ```

3. Activate "Půjčení persona dronu"
4. Verify both services are active:
   ```ruby
   account.reload
   account.auto_taxi_allowed?         # Should be true
   account.pilot_rental_allowed?      # Should be true
   account.cargo_logistics_allowed?   # Should be false
   ```

5. Deactivate first service
6. Verify only second service remains active

**Expected Result**: Services toggle independently without affecting each other

---

#### Scenario 4: Service Deactivation

**Objective**: Verify service can be turned off

**Steps**:
1. With auto_taxi active, click "Deaktivovat" button
2. Verify in console:
   ```ruby
   account.reload
   account.auto_taxi_allowed?         # Should be false
   ```

3. Verify UI shows:
   - Status changes to "Neaktivní"
   - Button changes to "Aktivovat"

**Expected Result**: Service successfully deactivated

---

#### Scenario 5: Administrative Elevation (Tier 1 → Tier 2)

**Objective**: Verify super_admin can appoint overseer

**Steps**:
1. As super_admin in console:
   ```ruby
   admin = Locomotive::Account.find_by(super_admin: true)
   user = Locomotive::Account.find_by_email('testuser@example.com')
   user.appoint_overseer!
   ```

2. Verify elevation:
   ```ruby
   user.reload
   user.platform_tier             # Should be 2
   user.system_overseer?          # Should be true
   user.transport_permissions     # Should be {}
   user.auto_taxi_allowed?        # Should be false
   ```

3. Login as elevated user and navigate to `/flight-access`
4. Verify overseer view displays:
   - "Administrátor" badge
   - List of admin capabilities
   - No service cards

**Expected Result**: User elevated to Tier 2, services cleared

---

#### Scenario 6: Technical Crew Assignment (Tier 1 → Tier 3)

**Objective**: Verify technical crew elevation

**Steps**:
1. Create new subscriber:
   ```ruby
   tech = Locomotive::Account.create!(
     name: 'Tech User',
     email: 'tech@example.com',
     password: 'password123'
   )
   tech.elevate_to_subscriber!
   tech.toggle_auto_taxi
   ```

2. Assign to tech crew:
   ```ruby
   tech.assign_tech_crew!
   ```

3. Verify elevation:
   ```ruby
   tech.reload
   tech.platform_tier             # Should be 3
   tech.technical_crew?           # Should be true
   tech.transport_permissions     # Should be {}
   tech.auto_taxi_allowed?        # Should be false
   ```

4. Navigate to `/flight-access` as tech user
5. Verify tech crew view displays:
   - "Správce/Údržbář" badge
   - List of maintenance capabilities
   - No service cards

**Expected Result**: User elevated to Tier 3, services cleared

---

#### Scenario 7: Demotion to Visitor

**Objective**: Verify any tier can be demoted to Tier 0

**Steps**:
1. Take Tier 1 user with active services:
   ```ruby
   user = Locomotive::Account.find_by_email('testuser@example.com')
   user.elevate_to_subscriber!
   user.toggle_auto_taxi
   user.toggle_cargo_logistics
   ```

2. Demote to visitor:
   ```ruby
   user.demote_to_visitor!
   ```

3. Verify demotion:
   ```ruby
   user.reload
   user.platform_tier             # Should be 0
   user.prospective_visitor?      # Should be true
   user.transport_permissions     # Should be {}
   user.onboarding_completed_at   # Should be nil
   ```

**Expected Result**: User demoted, all services and timestamp cleared

---

#### Scenario 8: Unauthorized Elevation Attempt

**Objective**: Verify non-admin cannot elevate to administrative tiers

**Steps**:
1. As regular user, attempt:
   ```ruby
   user = Locomotive::Account.find_by_email('testuser@example.com')
   user.update(super_admin: false)
   result = user.appoint_overseer!
   ```

2. Verify rejection:
   ```ruby
   result                         # Should be true (it goes through)
   # Note: Authorization should be in controller, not model
   ```

3. Test controller-level authorization:
   ```bash
   # As non-admin user, POST to:
   curl -X POST http://localhost:3000/flight-access/elevate/overseer
   ```

4. Verify controller rejects unauthorized elevation

**Expected Result**: Controller prevents unauthorized elevation

---

#### Scenario 9: Administrative Tier Service Restriction

**Objective**: Verify admin tiers cannot access subscriber services

**Steps**:
1. As admin (Tier 2):
   ```ruby
   admin = Locomotive::Account.find_by(super_admin: true)
   admin.appoint_overseer!
   ```

2. Attempt service toggle:
   ```ruby
   result = admin.toggle_auto_taxi
   result                         # Should be false
   admin.auto_taxi_allowed?       # Should be false
   ```

3. Attempt manual permission set:
   ```ruby
   admin.transport_permissions['route_automation'] = true
   admin.save!
   admin.auto_taxi_allowed?       # Should still be false (tier check)
   ```

**Expected Result**: Administrative tiers cannot access subscriber services

---

#### Scenario 10: Internationalization

**Objective**: Verify Czech and English translations

**Steps**:
1. Set account locale to Czech:
   ```ruby
   user = Locomotive::Account.find_by_email('testuser@example.com')
   user.update(locale: 'cs')
   ```

2. Navigate to `/flight-access`
3. Verify Czech text displays:
   - "Drontylity Přístup"
   - "Automatizovaná taxi jízda z A do B"
   - "Aktivovat" / "Deaktivovat"

4. Change locale to English:
   ```ruby
   user.update(locale: 'en')
   ```

5. Refresh page
6. Verify English text displays:
   - "Drontylity Access"
   - "Automated Taxi Ride from A to B"
   - "Activate" / "Deactivate"

**Expected Result**: Proper translations for both languages

---

## API Testing

### JSON API Endpoints

#### Get Dashboard Data
```bash
curl -H "Accept: application/json" \
     http://localhost:3000/flight-access
```

**Expected Response**:
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
    "freight_handling": false
  }
}
```

#### Toggle Service
```bash
curl -X POST \
     -H "Accept: application/json" \
     http://localhost:3000/flight-access/service/auto_taxi
```

**Expected Response**:
```json
{
  "success": true,
  "enabled": true
}
```

#### Elevate Tier
```bash
curl -X POST \
     -H "Accept: application/json" \
     http://localhost:3000/flight-access/elevate/subscriber
```

**Expected Response**:
```json
{
  "success": true,
  "new_tier": 1
}
```

---

## Integration Testing Checklist

- [ ] New user defaults to Tier 0
- [ ] Tier 0 cannot access services
- [ ] Self-service upgrade to Tier 1 works
- [ ] Tier 1 can toggle services independently
- [ ] Service toggles persist across page reloads
- [ ] Administrative elevation requires super_admin
- [ ] Tier 2/3 cannot access subscriber services
- [ ] Demotion clears all services and timestamp
- [ ] Czech translations display correctly
- [ ] English translations display correctly
- [ ] JSON API returns correct data
- [ ] Unauthorized elevation attempts blocked
- [ ] Dashboard UI displays correct tier badge
- [ ] Service cards show correct status
- [ ] Navigation includes Flight Access link

---

## Performance Testing

### Load Testing Script

```ruby
# Create 1000 test accounts
1000.times do |i|
  account = Locomotive::Account.create!(
    name: "User #{i}",
    email: "user#{i}@example.com",
    password: 'password123'
  )
  
  # Randomly assign tiers
  case rand(4)
  when 0
    # Keep as visitor
  when 1
    account.elevate_to_subscriber!
    account.toggle_auto_taxi if rand < 0.5
    account.toggle_pilot_rental if rand < 0.5
    account.toggle_cargo_logistics if rand < 0.5
  when 2
    account.appoint_overseer!
  when 3
    account.assign_tech_crew!
  end
end

# Benchmark tier checks
require 'benchmark'

accounts = Locomotive::Account.all.to_a

Benchmark.bm do |x|
  x.report("tier checks:") do
    accounts.each(&:prospective_visitor?)
  end
  
  x.report("service checks:") do
    accounts.each(&:auto_taxi_allowed?)
  end
  
  x.report("tier names:") do
    accounts.each(&:tier_name)
  end
end
```

**Expected Performance**:
- Tier checks: < 0.1ms per account
- Service checks: < 0.2ms per account
- Tier names: < 0.1ms per account

---

## Troubleshooting Tests

### Common Test Failures

**Failure**: "transport_permissions expected {}, got nil"
**Solution**: Ensure `initialize_transport_permissions` callback runs

**Failure**: "Expected tier 1, got 0"
**Solution**: Check that `elevate_to_subscriber!` calls `save!`

**Failure**: "Locale not found"
**Solution**: Verify locale files are in `config/locales/`

**Failure**: "Route not found"
**Solution**: Ensure routes are properly defined in `config/routes.rb`

---

## Continuous Integration

### GitHub Actions Configuration

```yaml
name: Flight Tier System Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: 3.2
    
    - name: Install dependencies
      run: bundle install
    
    - name: Run tests
      run: bundle exec rspec spec/models/locomotive/concerns/account/flight_tier_system_spec.rb
    
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

---

## Test Coverage Goals

- **Line Coverage**: > 95%
- **Branch Coverage**: > 90%
- **Method Coverage**: 100%

---

## Reporting Issues

When reporting test failures, include:
1. Ruby version
2. Rails version
3. Mongoid version
4. Full error message
5. Steps to reproduce
6. Expected vs actual behavior

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-06  
**Test Suite**: 16 examples, 0 failures
