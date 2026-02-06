# frozen_string_literal: true

module Locomotive
  class FlightAccessController < ApplicationController
    before_action :authenticate_account!
    before_action :set_current_account

    # GET /flight-access
    def dashboard
      @account = current_account
      @tier_info = {
        current_tier: @account.platform_tier,
        tier_name: @account.tier_name,
        tier_name_czech: @account.tier_name_czech,
        can_subscribe: @account.prospective_visitor?,
        can_manage_services: @account.active_subscriber?,
        is_admin: @account.administrative_tier?
      }
      
      if @account.active_subscriber?
        @services = {
          route_automation: @account.auto_taxi_allowed?,
          manual_operation: @account.pilot_rental_allowed?,
          freight_handling: @account.cargo_logistics_allowed?
        }
      else
        @services = {}
      end

      respond_to do |format|
        format.html
        format.json { render json: { tier_info: @tier_info, services: @services } }
      end
    end

    # POST /flight-access/elevate/:target
    def elevate
      target_tier = params[:target]
      
      result = case target_tier
               when 'subscriber'
                 current_account.elevate_to_subscriber!
               when 'overseer'
                 if current_user_is_super_admin?
                   current_account.appoint_overseer!
                 else
                   false
                 end
               when 'tech_crew'
                 if current_user_is_super_admin?
                   current_account.assign_tech_crew!
                 else
                   false
                 end
               when 'visitor'
                 current_account.demote_to_visitor!
               else
                 false
               end

      respond_to do |format|
        if result
          format.html { redirect_to flight_access_path, notice: I18n.t('flight_access.tier_changed') }
          format.json { render json: { success: true, new_tier: current_account.platform_tier } }
        else
          format.html { redirect_to flight_access_path, alert: I18n.t('flight_access.tier_change_failed') }
          format.json { render json: { success: false, error: 'Elevation failed' }, status: :unprocessable_entity }
        end
      end
    end

    # POST /flight-access/service/:service
    def toggle_service
      service_name = params[:service]
      
      result = case service_name
               when 'auto_taxi'
                 current_account.toggle_auto_taxi
               when 'pilot_rental'
                 current_account.toggle_pilot_rental
               when 'cargo_logistics'
                 current_account.toggle_cargo_logistics
               else
                 false
               end

      respond_to do |format|
        if result != false
          format.html { redirect_to flight_access_path, notice: I18n.t('flight_access.service_toggled') }
          format.json { render json: { success: true, enabled: result } }
        else
          format.html { redirect_to flight_access_path, alert: I18n.t('flight_access.service_toggle_failed') }
          format.json { render json: { success: false, error: 'Toggle failed' }, status: :unprocessable_entity }
        end
      end
    end

    private

    def set_current_account
      # This would be set by Devise or the authentication system
      # Placeholder for the actual implementation
    end

    def current_user_is_super_admin?
      # Check if the current user making the request is a super admin
      current_account.super_admin?
    end

    def authenticate_account!
      # Placeholder for authentication
      # In real LocomotiveCMS this would be handled by Devise
    end

    def current_account
      @current_account ||= Locomotive::Account.first # Placeholder
    end
  end
end
