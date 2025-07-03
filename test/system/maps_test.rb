require "application_system_test_case"

class MapsTest < ApplicationSystemTestCase
  setup do
    @map = maps(:one)
    @map.image.attach(
      io: File.open(Rails.root.join("test", "fixtures", "files", "test_image.png")),
      filename: "test_image.png",
      content_type: "image/png"
    )

    @user = users(:one)
    visit new_session_url
    login_as @user
  end

  test "visiting the index" do
    visit maps_url

    # Handle auth if needed
    if has_field?("email_address") && has_field?("password")
      login_as @user
    end

    # Basic page structure
    assert_selector "[data-testid='index-DOM-div']", wait: 10
    assert_current_path maps_path

    # Core UI elements
    assert_selector "[data-testid='hamburger-menu']"  # hamburger button
    assert_selector "[data-testid='new-map']"  # new map button
    assert_selector "[data-controller='maps']"  # Stimulus controller loaded
    assert_selector "[data-maps-target='preview']"  # preview area exists

    # Essential content areas exist
    assert_selector "h1", text: "Your Maps"
  end

  test "should create map" do
    visit maps_url
    if has_field?("email_address") && has_field?("password")
      login_as @user
    end

    # Click the + button
    find("[data-testid='new-map']").click

    # Wait for new map form page to load
    assert_selector "[data-testid='form-name-field']", wait: 10
    assert_current_path new_map_path

    # Fill out and submit (using Rails-generated field names)
    fill_in "map[name]", with: @map.name
    find("[data-testid='submit-map']").click

    # Wait for redirect to the map details page
    assert_selector "[data-testid='map-details-partial-DOM']", wait: 10
    assert_current_path map_path(Map.last)
  end

  test "should update Map" do
    visit maps_url  # Start at the index, not the show page

    if has_field?("email_address") && has_field?("password")
      login_as @user
    end

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']", wait: 10

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@map.id}']").click

    # Wait for the edit button to become enabled (remove btn-disabled class via javascript)
    assert_selector "[data-id='edit-map']:not(.btn-disabled)", wait: 10

    # Click the edit button
    find("[data-id='edit-map']").click

    # Now we should be on the edit form page
    assert_selector "form", wait: 20
    assert_selector "[data-testid='form-name-field']", wait: 20
    assert_current_path edit_map_path(@map)

    # Check that form exists and fill it out
    assert_selector "input[name='map[name]']", wait: 10

    fill_in "map[name]", with: "Updated #{@map.name}"
    find("input[type='submit']").click

    # After update, redirects back to map details page
    assert_selector "[data-testid='map-details-partial-DOM']", wait: 10

    # Check for success message
    assert_text "Map was successfully updated"
  end

  test "should destroy Map" do
    visit map_url(@map)

    if has_field?("email_address") && has_field?("password")
      login_as @user
    end

    # Open fly-out
    assert_selector "#flyout-tab-toggle", wait: 10
    find("#flyout-tab-toggle").click

    assert_selector "[data-controller='maps']", wait: 10

    # Edit the Map
    find("#edit-map-button").click

    # Close fly-out
    find("#fly-out-close-button").click

    # Find and click the delete button
    assert_selector "#delete_map_button", wait: 10
    find("#delete_map_button").click

    assert_selector "[data-testid='delete-map-button']", wait: 10
    find("[data-testid='delete-map-button']").click

    # Wait for redirect to maps index
    assert_selector "[data-testid='index-DOM-div']", wait: 10
    assert_current_path maps_path
  end
end
