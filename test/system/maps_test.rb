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
      puts "duplicate login was required for INDEX VISIT test"
    end

    # Basic page structure
    assert_selector "[data-testid='index-DOM-div']"
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
      puts "duplicate login was required for CREATE test"
    end

    # Click the + button, then the "New Map" button
    find("[data-testid='new-map']").click
    find("[data-testid='new_map_path_button']").click

    # Wait for new map form page to load
    assert_selector "h1"
    assert_selector "[data-testid='map-form']"
    assert_selector "[data-testid='form-name-field']"
    assert_current_path new_map_path

    # Fill out all required fields
    fill_in "map[name]", with: @map.name
    fill_in "map[description]", with: @map.description || "Test map description"

    # Attach a test image file
    # You'll need to create a test image file in your test fixtures
    attach_file "map[image]", Rails.root.join("test", "fixtures", "files", "test_image.png")

    find("[data-testid='submit-map']").click

    # Wait for redirect to the map details page
    assert_selector "#header-section"
    assert_current_path map_path(Map.last)
  end

  test "should update map" do
    visit maps_url

    if has_field?("email_address") && has_field?("password")
      login_as @user
      puts "duplicate login was required for UPDATE test"
    end

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@map.id}']").click

    # Wait for the edit button to become enabled (remove btn-disabled class via javascript)
    assert_selector "[data-id='edit-map']:not(.btn-disabled)"

    # Click the edit button
    find("[data-id='edit-map']").click

    # Now we should be on the edit form page
    assert_selector "form"
    assert_selector "[data-testid='form-name-field']"
    assert_current_path edit_map_path(@map)

    # Check that form exists and fill it out
    assert_selector "input[name='map[name]']"

    fill_in "map[name]", with: "Updated #{@map.name}"

    # Fill in description (required field)
    fill_in "map[description]", with: "Updated description for #{@map.name}"

    # Note: For edit, image is not required if one already exists
    # The form shows "Leave empty to keep current image" when editing
    # So we don't need to attach a new image unless we want to test image updates

    find("[data-testid='submit-map']").click

    # After update, redirects back to map details page
    assert_current_path map_path(@map)

    # Check for success message
    assert_text "Map was successfully updated"
  end

  test "should validate map creation and edit" do
    visit maps_url
    if has_field?("email_address") && has_field?("password")
      login_as @user
      puts "duplicate login was required for VALIDATION test"
    end

    # Click the + button, then the "New Map" button
    find("[data-testid='new-map']").click
    find("[data-testid='new_map_path_button']").click

    # Wait for new map form page to load
    assert_selector "[data-testid='map-form']"
    assert_current_path new_map_path

    # Try to submit without filling required fields
    find("[data-testid='submit-map']").click

    # Should stay on the same page and show validation errors
    assert_current_path new_map_path
    assert_selector ".input-error, .textarea-error, .file-input-error"
  end

  test "should replace map image" do
    visit maps_url

    if has_field?("email_address") && has_field?("password")
      login_as @user
      puts "duplicate login was required for UPDATE WITH IMAGE test"
    end

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@map.id}']").click

    # Wait for the edit button to become enabled
    assert_selector "[data-id='edit-map']:not(.btn-disabled)"

    # Click the edit button
    find("[data-id='edit-map']").click

    # Now we should be on the edit form page
    assert_current_path edit_map_path(@map)

    # Fill out form with new image
    fill_in "map[name]", with: "Updated #{@map.name}"
    fill_in "map[description]", with: "Updated description with new image"

    # Attach a new test image
    attach_file "map[image]", Rails.root.join("test", "fixtures", "files", "test_replacement_image.jpg")

    find("[data-testid='submit-map']").click

    # After update, redirects back to map details page
    assert_current_path map_path(@map)
    assert_text "Map was successfully updated"
  end

  test "should destroy map" do
    visit maps_url

    if has_field?("email_address") && has_field?("password")
      puts "duplicate login was required for DESTROY test"
      login_as @user
    end

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@map.id}']").click

    # Wait for the play button to become enabled (remove btn-disabled class via javascript)
    assert_selector "[data-id='play-map']:not(.btn-disabled)"

    # Click the play button
    find("[data-id='play-map']").click

    # Wait for map details page to load
    assert_selector "#controls"

    # Open fly-out
    assert_selector "#flyout-tab-toggle"
    find("#flyout-tab-toggle").click

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Edit the Map
    find("#edit-map-button").click

    # Find and click the delete button
    assert_selector "[data-controller='maps']"
    assert_selector "#delete_map_button_map"
    find("#delete_map_button_map").click

    # Find and click the confirmation button in the modal pop-up
    assert_selector "[data-testid='delete-map-button-map']"
    find("[data-testid='delete-map-button-map']").click

    # Wait for redirect to maps index
    assert_selector "[data-testid='index-DOM-div']"
    assert_current_path maps_path
  end
end
