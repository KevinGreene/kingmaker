ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end

# System Tests should not run parallel transactions
class ActionDispatch::SystemTestCase
  # Disable transactional fixtures for system tests to avoid race conditions
  self.use_transactional_tests = false
  parallelize(workers: 1)

  # Clean up after each test
  teardown do
    # Clean up any created records if needed
    # This ensures a clean state for the next test
  end
end
