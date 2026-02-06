# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Locomotive::Concerns::Account::FlightTierSystem do
  let(:account) { Locomotive::Account.create!(name: 'Test User', email: 'test@example.com', password: 'password123') }

  describe 'tier constants' do
    it 'defines TIER_PROSPECTIVE_VISITOR as 0' do
      expect(Locomotive::Concerns::Account::FlightTierSystem::TIER_PROSPECTIVE_VISITOR).to eq(0)
    end

    it 'defines TIER_ACTIVE_SUBSCRIBER as 1' do
      expect(Locomotive::Concerns::Account::FlightTierSystem::TIER_ACTIVE_SUBSCRIBER).to eq(1)
    end

    it 'defines TIER_SYSTEM_OVERSEER as 2' do
      expect(Locomotive::Concerns::Account::FlightTierSystem::TIER_SYSTEM_OVERSEER).to eq(2)
    end

    it 'defines TIER_TECHNICAL_CREW as 3' do
      expect(Locomotive::Concerns::Account::FlightTierSystem::TIER_TECHNICAL_CREW).to eq(3)
    end
  end

  describe 'default state' do
    it 'starts as prospective visitor (tier 0)' do
      expect(account.platform_tier).to eq(0)
      expect(account.prospective_visitor?).to be true
    end

    it 'has empty transport permissions' do
      expect(account.transport_permissions).to eq({})
    end

    it 'has no onboarding completion date' do
      expect(account.onboarding_completed_at).to be_nil
    end
  end

  describe '#elevate_to_subscriber!' do
    it 'changes tier to active subscriber' do
      account.elevate_to_subscriber!
      expect(account.platform_tier).to eq(1)
      expect(account.active_subscriber?).to be true
    end

    it 'sets onboarding completion timestamp' do
      account.elevate_to_subscriber!
      expect(account.onboarding_completed_at).to be_present
    end

    it 'initializes transport permissions' do
      account.elevate_to_subscriber!
      expect(account.transport_permissions).to eq({
        'route_automation' => false,
        'manual_operation' => false,
        'freight_handling' => false
      })
    end

    it 'fails if already an administrator' do
      account.update!(platform_tier: 2)
      result = account.elevate_to_subscriber!
      expect(result).to be false
    end
  end

  describe '#appoint_overseer!' do
    it 'changes tier to system overseer' do
      account.appoint_overseer!
      expect(account.platform_tier).to eq(2)
      expect(account.system_overseer?).to be true
    end

    it 'clears transport permissions' do
      account.elevate_to_subscriber!
      account.toggle_auto_taxi
      account.appoint_overseer!
      expect(account.transport_permissions).to eq({})
    end
  end

  describe '#assign_tech_crew!' do
    it 'changes tier to technical crew' do
      account.assign_tech_crew!
      expect(account.platform_tier).to eq(3)
      expect(account.technical_crew?).to be true
    end

    it 'clears transport permissions' do
      account.elevate_to_subscriber!
      account.toggle_auto_taxi
      account.assign_tech_crew!
      expect(account.transport_permissions).to eq({})
    end
  end

  describe '#demote_to_visitor!' do
    it 'changes tier back to visitor' do
      account.elevate_to_subscriber!
      account.demote_to_visitor!
      expect(account.platform_tier).to eq(0)
      expect(account.prospective_visitor?).to be true
    end

    it 'clears transport permissions' do
      account.elevate_to_subscriber!
      account.toggle_auto_taxi
      account.demote_to_visitor!
      expect(account.transport_permissions).to eq({})
    end

    it 'clears onboarding timestamp' do
      account.elevate_to_subscriber!
      account.demote_to_visitor!
      expect(account.onboarding_completed_at).to be_nil
    end
  end

  describe 'service toggles for active subscribers' do
    before { account.elevate_to_subscriber! }

    describe '#toggle_auto_taxi' do
      it 'activates route automation service' do
        result = account.toggle_auto_taxi
        expect(result).to be true
        expect(account.auto_taxi_allowed?).to be true
      end

      it 'deactivates when toggled again' do
        account.toggle_auto_taxi
        result = account.toggle_auto_taxi
        expect(result).to be false
        expect(account.auto_taxi_allowed?).to be false
      end
    end

    describe '#toggle_pilot_rental' do
      it 'activates manual operation service' do
        result = account.toggle_pilot_rental
        expect(result).to be true
        expect(account.pilot_rental_allowed?).to be true
      end

      it 'deactivates when toggled again' do
        account.toggle_pilot_rental
        result = account.toggle_pilot_rental
        expect(result).to be false
        expect(account.pilot_rental_allowed?).to be false
      end
    end

    describe '#toggle_cargo_logistics' do
      it 'activates freight handling service' do
        result = account.toggle_cargo_logistics
        expect(result).to be true
        expect(account.cargo_logistics_allowed?).to be true
      end

      it 'deactivates when toggled again' do
        account.toggle_cargo_logistics
        result = account.toggle_cargo_logistics
        expect(result).to be false
        expect(account.cargo_logistics_allowed?).to be false
      end
    end

    it 'allows independent service activation' do
      account.toggle_auto_taxi
      expect(account.auto_taxi_allowed?).to be true
      expect(account.pilot_rental_allowed?).to be false
      expect(account.cargo_logistics_allowed?).to be false
    end
  end

  describe 'service restrictions' do
    it 'prevents service access for prospective visitors' do
      expect(account.auto_taxi_allowed?).to be false
      expect(account.pilot_rental_allowed?).to be false
      expect(account.cargo_logistics_allowed?).to be false
    end

    it 'prevents service toggles for prospective visitors' do
      result = account.toggle_auto_taxi
      expect(result).to be false
    end

    it 'prevents service access for administrators' do
      account.appoint_overseer!
      expect(account.auto_taxi_allowed?).to be false
    end

    it 'prevents service toggles for administrators' do
      account.appoint_overseer!
      result = account.toggle_auto_taxi
      expect(result).to be false
    end
  end

  describe '#tier_name' do
    it 'returns correct English name for tier 0' do
      expect(account.tier_name).to eq('Prospective Visitor')
    end

    it 'returns correct English name for tier 1' do
      account.elevate_to_subscriber!
      expect(account.tier_name).to eq('Active Subscriber')
    end

    it 'returns correct English name for tier 2' do
      account.appoint_overseer!
      expect(account.tier_name).to eq('System Overseer')
    end

    it 'returns correct English name for tier 3' do
      account.assign_tech_crew!
      expect(account.tier_name).to eq('Technical Crew')
    end
  end

  describe '#tier_name_czech' do
    it 'returns correct Czech name for tier 0' do
      expect(account.tier_name_czech).to eq('Neregistrovaný uživatel')
    end

    it 'returns correct Czech name for tier 1' do
      account.elevate_to_subscriber!
      expect(account.tier_name_czech).to eq('Registrovaný uživatel')
    end

    it 'returns correct Czech name for tier 2' do
      account.appoint_overseer!
      expect(account.tier_name_czech).to eq('Administrátor')
    end

    it 'returns correct Czech name for tier 3' do
      account.assign_tech_crew!
      expect(account.tier_name_czech).to eq('Správce/Údržbář')
    end
  end

  describe '#administrative_tier?' do
    it 'returns false for prospective visitor' do
      expect(account.administrative_tier?).to be false
    end

    it 'returns false for active subscriber' do
      account.elevate_to_subscriber!
      expect(account.administrative_tier?).to be false
    end

    it 'returns true for system overseer' do
      account.appoint_overseer!
      expect(account.administrative_tier?).to be true
    end

    it 'returns true for technical crew' do
      account.assign_tech_crew!
      expect(account.administrative_tier?).to be true
    end
  end
end
