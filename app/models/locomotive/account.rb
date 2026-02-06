# frozen_string_literal: true

module Locomotive
  class Account
    include Mongoid::Document
    include Mongoid::Timestamps
    
    # Include Devise modules (assuming LocomotiveCMS uses Devise)
    devise :database_authenticatable, :registerable,
           :recoverable, :rememberable, :validatable

    # Include the Flight Tier System
    include Locomotive::Concerns::Account::FlightTierSystem

    # Basic account fields
    field :name, type: String
    field :email, type: String
    field :locale, type: String, default: 'en'
    field :super_admin, type: Boolean, default: false

    # Indexes
    index({ email: 1 }, { unique: true })

    # Validations
    validates :name, presence: true
    validates :email, presence: true, uniqueness: true
  end
end
