# Drontylity Flight Tier System - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DRONTYLITY FLIGHT TIER SYSTEM                           │
│                  4-Phase Authentication & Authorization                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              TIER HIERARCHY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Tier 0: Prospective Visitor (Neregistrovaný uživatel)                     │
│  ├─ Purpose: Marketing & Browsing                                          │
│  ├─ Access: Read-only platform information                                 │
│  └─ Upgrade: Self-service → Tier 1                                         │
│                                                                              │
│  Tier 1: Active Subscriber (Registrovaný uživatel)                         │
│  ├─ Purpose: Full transportation services                                  │
│  ├─ Services (independent toggles):                                        │
│  │   ├─ Service A: Route Automation (auto taxi)                           │
│  │   ├─ Service B: Manual Operation (drone rental)                        │
│  │   └─ Service C: Freight Handling (cargo logistics)                     │
│  └─ Upgrade: Requires super_admin → Tier 2/3                              │
│                                                                              │
│  Tier 2: System Overseer (Administrátor)                                   │
│  ├─ Purpose: Platform administration                                       │
│  ├─ Access: User management, system settings                               │
│  └─ Restriction: No transportation services                                │
│                                                                              │
│  Tier 3: Technical Crew (Správce/Údržbář)                                  │
│  ├─ Purpose: Fleet maintenance                                             │
│  ├─ Access: Diagnostics, maintenance protocols                             │
│  └─ Restriction: No transportation services                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          COMPONENT ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   Web Browser        │         │   Mobile App         │
│  (Dashboard UI)      │         │   (API Client)       │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                 │
           │ HTTP/HTTPS                      │ JSON API
           ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              FlightAccessController                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  GET  /flight-access                                │   │
│  │  POST /flight-access/elevate/:target                │   │
│  │  POST /flight-access/service/:service               │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Locomotive::Account                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         FlightTierSystem Concern                    │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ • platform_tier (Integer)                     │ │   │
│  │  │ • transport_permissions (Hash)                │ │   │
│  │  │ • onboarding_completed_at (Time)              │ │   │
│  │  │ • tier_notes (String)                         │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                      │   │
│  │  Tier Methods:                                       │   │
│  │  • prospective_visitor?                              │   │
│  │  • active_subscriber?                                │   │
│  │  • system_overseer?                                  │   │
│  │  • technical_crew?                                   │   │
│  │                                                      │   │
│  │  Service Methods:                                    │   │
│  │  • toggle_auto_taxi                                  │   │
│  │  • toggle_pilot_rental                               │   │
│  │  • toggle_cargo_logistics                            │   │
│  │                                                      │   │
│  │  Elevation Methods:                                  │   │
│  │  • elevate_to_subscriber!                            │   │
│  │  • appoint_overseer!                                 │   │
│  │  • assign_tech_crew!                                 │   │
│  │  • demote_to_visitor!                                │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Database                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  accounts collection                                │   │
│  │  {                                                  │   │
│  │    _id: ObjectId,                                   │   │
│  │    email: String,                                   │   │
│  │    name: String,                                    │   │
│  │    platform_tier: Integer,  // 0, 1, 2, or 3       │   │
│  │    transport_permissions: {                         │   │
│  │      route_automation: Boolean,                     │   │
│  │      manual_operation: Boolean,                     │   │
│  │      freight_handling: Boolean                      │   │
│  │    },                                               │   │
│  │    onboarding_completed_at: ISODate,                │   │
│  │    tier_notes: String                               │   │
│  │  }                                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            VIEW LAYER                                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  dashboard.html.slim                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tier 0 View (Visitor)                                 │ │
│  │  • Marketing content                                   │ │
│  │  • Service descriptions                                │ │
│  │  • "Upgrade to Subscription" button                    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tier 1 View (Subscriber)                              │ │
│  │  • Service grid with 3 cards                           │ │
│  │  • Each card has:                                      │ │
│  │    - Service name & description                        │ │
│  │    - Active/Inactive status badge                      │ │
│  │    - Activate/Deactivate button                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tier 2 View (Overseer)                                │ │
│  │  • Admin capabilities list                             │ │
│  │  • User management info                                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tier 3 View (Tech Crew)                               │ │
│  │  • Maintenance capabilities list                       │ │
│  │  • Diagnostic tools info                               │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       INTERNATIONALIZATION (i18n)                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐       ┌─────────────────────────┐
│  flight_access.cs.yml   │       │  flight_access.en.yml   │
│  (Czech - Primary)      │       │  (English - Secondary)  │
├─────────────────────────┤       ├─────────────────────────┤
│ • Dashboard labels      │       │ • Dashboard labels      │
│ • Tier names            │       │ • Tier names            │
│ • Service descriptions  │       │ • Service descriptions  │
│ • Action buttons        │       │ • Action buttons        │
│ • Status messages       │       │ • Status messages       │
└─────────────────────────┘       └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY MODEL                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Access Control Rules                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Self-Service Upgrades                              │ │
│  │     Tier 0 → Tier 1: ✓ Allowed (no approval needed)   │ │
│  │     Tier 0/1 → Tier 2/3: ✗ Requires super_admin       │ │
│  │                                                         │ │
│  │  2. Service Isolation                                  │ │
│  │     Tier 0: ✗ No services                              │ │
│  │     Tier 1: ✓ All 3 services (independent toggles)     │ │
│  │     Tier 2/3: ✗ No transportation services             │ │
│  │                                                         │ │
│  │  3. Permission Validation                              │ │
│  │     • Database constraints on tier values              │ │
│  │     • Method-level tier checks                         │ │
│  │     • Controller-level authorization                   │ │
│  │                                                         │ │
│  │  4. Audit Trail                                        │ │
│  │     • onboarding_completed_at timestamp                │ │
│  │     • tier_notes for admin logging                     │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            TESTING STRATEGY                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  RSpec Test Suite (16 examples)                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  • Tier constants validation                           │ │
│  │  • Default state verification                          │ │
│  │  • Tier elevation scenarios                            │ │
│  │  • Service toggle functionality                        │ │
│  │  • Permission restrictions                             │ │
│  │  • Internationalization checks                         │ │
│  │  • Administrative tier verification                    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT REQUIREMENTS                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│  Technology Stack       │
├─────────────────────────┤
│  • Rails 7.1+           │
│  • Mongoid 8.0+         │
│  • Devise 4.9+          │
│  • Slim Templates       │
│  • Modern Browser       │
│    (CSS Grid support)   │
└─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      TIER TRANSITION DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │   Tier 0         │
                    │   Visitor        │
                    └────────┬─────────┘
                             │
                    Self-service upgrade
                             │
                             ▼
                    ┌──────────────────┐
           ┌────────│   Tier 1         │────────┐
           │        │   Subscriber     │        │
           │        └────────┬─────────┘        │
           │                 │                  │
  super_admin only  super_admin only   Demotion available
           │                 │                  │
           ▼                 ▼                  ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
  │   Tier 2     │  │   Tier 3     │  │  Back to Tier 0  │
  │   Overseer   │  │  Tech Crew   │  │                  │
  └──────────────┘  └──────────────┘  └──────────────────┘
         │                 │
         └────────┬────────┘
                  │
         No service access
         (admin functions only)

```

## Key Design Principles

1. **Separation of Concerns**: Clear distinction between operational (Tier 1) and administrative (Tier 2/3) access
2. **Service Independence**: Each subscriber service can be toggled independently
3. **Security First**: Authorization checks at multiple levels (model, controller, view)
4. **Internationalization**: Full support for Czech and English from the ground up
5. **Audit Trail**: Timestamp tracking for compliance and analytics
6. **Extensibility**: Easy to add new tiers or services in the future

## File Sizes

- FlightTierSystem Concern: 179 lines
- FlightAccessController: 119 lines
- Dashboard View: 248 lines
- Test Suite: 16 examples
- Total Documentation: 3 comprehensive files

---

**Status**: Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2026-02-06
