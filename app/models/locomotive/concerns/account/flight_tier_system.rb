# frozen_string_literal: true

module Locomotive
  module Concerns
    module Account
      module FlightTierSystem
        extend ActiveSupport::Concern

        # Tier levels for the Drontylity platform
        TIER_PROSPECTIVE_VISITOR = 0  # Unregistered user - browsing only
        TIER_ACTIVE_SUBSCRIBER = 1    # Registered user - full services
        TIER_SYSTEM_OVERSEER = 2      # Administrator
        TIER_TECHNICAL_CREW = 3       # Manager/Maintainer

        included do
          # Fields for tier system
          field :platform_tier, type: Integer, default: TIER_PROSPECTIVE_VISITOR
          field :transport_permissions, type: Hash, default: -> { {} }
          field :onboarding_completed_at, type: Time
          field :tier_notes, type: String

          # Validations
          validates :platform_tier, inclusion: { 
            in: [TIER_PROSPECTIVE_VISITOR, TIER_ACTIVE_SUBSCRIBER, TIER_SYSTEM_OVERSEER, TIER_TECHNICAL_CREW],
            message: "must be a valid tier level"
          }

          # Callbacks
          before_save :initialize_transport_permissions
        end

        # Instance methods for tier checking
        def prospective_visitor?
          platform_tier == TIER_PROSPECTIVE_VISITOR
        end

        def active_subscriber?
          platform_tier == TIER_ACTIVE_SUBSCRIBER
        end

        def system_overseer?
          platform_tier == TIER_SYSTEM_OVERSEER
        end

        def technical_crew?
          platform_tier == TIER_TECHNICAL_CREW
        end

        def administrative_tier?
          system_overseer? || technical_crew?
        end

        # Service permission checkers
        def auto_taxi_allowed?
          active_subscriber? && transport_permissions['route_automation'] == true
        end

        def pilot_rental_allowed?
          active_subscriber? && transport_permissions['manual_operation'] == true
        end

        def cargo_logistics_allowed?
          active_subscriber? && transport_permissions['freight_handling'] == true
        end

        # Tier elevation methods
        def elevate_to_subscriber!
          return false if administrative_tier?
          
          self.platform_tier = TIER_ACTIVE_SUBSCRIBER
          self.onboarding_completed_at = Time.current
          initialize_transport_permissions
          save!
        end

        def appoint_overseer!
          return false unless can_elevate_to_administrative?
          
          self.platform_tier = TIER_SYSTEM_OVERSEER
          clear_transport_permissions
          save!
        end

        def assign_tech_crew!
          return false unless can_elevate_to_administrative?
          
          self.platform_tier = TIER_TECHNICAL_CREW
          clear_transport_permissions
          save!
        end

        def demote_to_visitor!
          self.platform_tier = TIER_PROSPECTIVE_VISITOR
          clear_transport_permissions
          self.onboarding_completed_at = nil
          save!
        end

        # Service toggles
        def toggle_auto_taxi
          return false unless active_subscriber?
          toggle_service('route_automation')
        end

        def toggle_pilot_rental
          return false unless active_subscriber?
          toggle_service('manual_operation')
        end

        def toggle_cargo_logistics
          return false unless active_subscriber?
          toggle_service('freight_handling')
        end

        # Helper methods
        def tier_name
          case platform_tier
          when TIER_PROSPECTIVE_VISITOR
            'Prospective Visitor'
          when TIER_ACTIVE_SUBSCRIBER
            'Active Subscriber'
          when TIER_SYSTEM_OVERSEER
            'System Overseer'
          when TIER_TECHNICAL_CREW
            'Technical Crew'
          else
            'Unknown'
          end
        end

        def tier_name_czech
          case platform_tier
          when TIER_PROSPECTIVE_VISITOR
            'Neregistrovaný uživatel'
          when TIER_ACTIVE_SUBSCRIBER
            'Registrovaný uživatel'
          when TIER_SYSTEM_OVERSEER
            'Administrátor'
          when TIER_TECHNICAL_CREW
            'Správce/Údržbář'
          else
            'Neznámý'
          end
        end

        private

        def can_elevate_to_administrative?
          # Only allow elevation to administrative tiers from non-administrative tiers
          !administrative_tier?
        end

        def initialize_transport_permissions
          if active_subscriber? && transport_permissions.blank?
            self.transport_permissions = {
              'route_automation' => false,
              'manual_operation' => false,
              'freight_handling' => false
            }
          end
        end

        def clear_transport_permissions
          self.transport_permissions = {}
        end

        def toggle_service(service_key)
          return false unless active_subscriber?
          
          initialize_transport_permissions if transport_permissions.blank?
          current_value = transport_permissions[service_key] || false
          self.transport_permissions[service_key] = !current_value
          save!
          !current_value
        end
      end
    end
  end
end
