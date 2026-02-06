# frozen_string_literal: true

# Drontylity Flight Access Routes
# These routes handle the 4-phase authentication and authorization system

Rails.application.routes.draw do
  namespace :locomotive do
    # Flight Access Dashboard and Actions
    get 'flight-access', to: 'flight_access#dashboard', as: :flight_access
    post 'flight-access/elevate/:target', to: 'flight_access#elevate', as: :elevate_flight_access
    post 'flight-access/service/:service', to: 'flight_access#toggle_service', as: :toggle_service_flight_access
  end
end
