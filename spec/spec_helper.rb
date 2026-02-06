# frozen_string_literal: true

# This file is used by RSpec for configuring the testing environment
# For the Flight Tier System tests

# Require this file in your spec files to set up the testing environment
# require 'spec_helper'

RSpec.configure do |config|
  # Use documentation format for better test output
  config.formatter = :documentation
  
  # Show the slowest examples
  config.profile_examples = 10
  
  # Run specs in random order to surface order dependencies
  config.order = :random
  
  # Seed global randomization in this process using the `--seed` CLI option
  Kernel.srand config.seed
  
  # Enable color output
  config.color = true
  
  # Configure expectations
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end
  
  # Configure mocks
  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end
  
  # Shared context marker
  config.shared_context_metadata_behavior = :apply_to_host_groups
end
