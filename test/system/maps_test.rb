require "application_system_test_case"

class MapsTest < ApplicationSystemTestCase
  setup do
    @gm_user = users(:one)  # This user will be the GM
    @player_user = users(:two)  # This user will be a regular player

    # Map and player associations are set up in fixtures
    @gm_map = maps(:one)
    @player_map = maps(:two)
    @shared_map = maps(:three)
    @inaccessible_map = maps(:four)
    @gm_player = players(:one)  # Player one is the GM (gm: true in player_maps)
    @player = players(:two)  # Player two is a regular player (gm: false in player_maps)

    # Setup test maps
    @gm_map.image.attach(
      io: File.open(Rails.root.join("test", "fixtures", "files", "test_image.png")),
      filename: "test_image.png",
      content_type: "image/png"
    )
    @gm_map.save!  # Important to save the map
    @gm_map.reload  # Helps with ensuring storage of image
    # Player Map
    @player_map.image.attach(
      io: File.open(Rails.root.join("test", "fixtures", "files", "test_image.png")),
      filename: "test_image.png",
      content_type: "image/png"
    )
    @player_map.save!
    @player_map.reload
    # Shared Map
    @shared_map.image.attach(
      io: File.open(Rails.root.join("test", "fixtures", "files", "test_image.png")),
      filename: "test_image.png",
      content_type: "image/png"
    )
    @shared_map.save!
    @shared_map.reload
  end

  def login_as_gm
    visit new_session_url
    login_as @gm_user
  end

  def login_as_player
    visit new_session_url
    login_as @player_user
  end

  def ensure_logged_in_as_gm
    if has_field?("email_address") && has_field?("password")
      login_as @gm_user
      puts "duplicate login was required for GM"
    end
  end

  def ensure_logged_in_as_player
    if has_field?("email_address") && has_field?("password")
      login_as @player_user
      puts "duplicate login was required for Player"
    end
  end

  test "visiting the index as GM" do
    login_as_gm
    visit maps_url

    ensure_logged_in_as_gm

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

  test "visiting the index as player" do
    login_as_player
    visit maps_url

    ensure_logged_in_as_player

    # Basic page structure
    assert_selector "[data-testid='index-DOM-div']"
    assert_current_path maps_path

    # Core UI elements should still be present
    assert_selector "[data-testid='hamburger-menu']"
    assert_selector "[data-controller='maps']"
    assert_selector "[data-maps-target='preview']"

    # Essential content areas exist
    assert_selector "h1", text: "Your Maps"
  end

  test "should create map as GM" do
    login_as_gm
    visit maps_url
    ensure_logged_in_as_gm

    # Click the + button, then the "New Map" button
    find("[data-testid='new-map']").click
    find("[data-testid='new_map_path_button']").click

    # Wait for new map form page to load
    assert_selector "h1"
    assert_selector "[data-testid='map-form']"
    assert_selector "[data-testid='form-name-field']"
    assert_current_path new_map_path

    # Fill out all required fields
    fill_in "map[name]", with: "Test Map Created by GM"
    fill_in "map[description]", with: "Test map description created by GM"

    # Attach a test image file
    attach_file "map[image]", Rails.root.join("test", "fixtures", "files", "test_image.png")

    # Submit the form
    find("[data-testid='submit-map']").click

    # Wait for the success message - long wait in case database is slow to receive data
    assert_text "Map was successfully created", wait: 20

    # Verify the map was created and the user is set as GM in player_maps
    created_map = Map.find_by_name("Test Map Created by GM")
    player_map = PlayerMap.find_by(map: created_map, player: Player.find_by(user: @gm_user))
    assert player_map.gm, "User should be set as GM when creating a map"

    # Verify redirect
    assert_current_path map_path(Map.find_by_name("Test Map Created by GM").id)
  end

  test "should update map as GM" do
    login_as_gm
    visit maps_url
    ensure_logged_in_as_gm

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@gm_map.id}']").click

    # Wait for the edit button to become enabled (remove btn-disabled class via javascript)
    assert_selector "[data-id='edit-map']:not(.btn-disabled)"

    # Click the edit button
    find("[data-id='edit-map']").click

    # Now we should be on the edit form page
    assert_selector "form"
    assert_selector "[data-testid='form-name-field']"
    assert_current_path edit_map_path(@gm_map)

    # Check that form exists and fill it out
    assert_selector "input[name='map[name]']"

    fill_in "map[name]", with: "Updated #{@gm_map.name}"
    fill_in "map[description]", with: "Updated description for #{@gm_map.name}"

    click_button "Update Map"

    # After update, redirects back to map details page
    assert_current_path map_path(@gm_map)

    # Check for success message
    assert_text "Map was successfully updated"
  end

  test "should not allow player to edit map" do
    login_as_player
    visit maps_url
    ensure_logged_in_as_player

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Attempt to edit a map in the list
    find("[data-testid='map-card-#{@player_map.id}']").click
    find("[data-id='edit-map']").click
    assert_current_path(maps_path)
  end

  test "should deny direct access to edit form for player" do
    login_as_player
    visit maps_url
    ensure_logged_in_as_player

    # Try to directly access the edit form
    visit edit_map_path(@player_map.id)

    # Should be redirected to maps list
    assert_current_path(maps_path)
  end

  test "should validate map creation and edit" do
    login_as_gm
    visit maps_url
    ensure_logged_in_as_gm

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

  test "should replace map image as GM" do
    login_as_gm
    visit maps_url
    ensure_logged_in_as_gm

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@gm_map.id}']").click

    # Wait for the edit button to become enabled
    assert_selector "[data-id='edit-map']:not(.btn-disabled)"

    # Click the edit button
    find("[data-id='edit-map']").click

    # Now we should be on the edit form page
    assert_current_path edit_map_path(@gm_map)

    # Fill out form with new image
    fill_in "map[name]", with: "Updated #{@gm_map.name}"
    fill_in "map[description]", with: "Updated description with new image"

    # Attach a new test image
    attach_file "map[image]", Rails.root.join("test", "fixtures", "files", "test_replacement_image.jpg")

    find("[data-testid='submit-map']").click

    # After update, redirects back to map details page
    assert_current_path map_path(@gm_map)
    assert_text "Map was successfully updated"
  end

  test "should destroy map as GM owner" do
    login_as_gm
    visit maps_url
    ensure_logged_in_as_gm

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@gm_map.id}']").click

    # Wait for the play button to become enabled (remove btn-disabled class via javascript)
    assert_selector "[data-id='play-map']:not(.btn-disabled)"

    # Click the play button
    find("[data-id='play-map']").click

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

  test "should not allow player to delete map" do
    login_as_player
    visit maps_url
    ensure_logged_in_as_player

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@player_map.id}']").click

    # Wait for the play button to become enabled
    assert_selector "[data-id='play-map']:not(.btn-disabled)"

    # Click the play button
    find("[data-id='play-map']").click

    # Open fly-out
    assert_selector "#flyout-tab-toggle"
    find("#flyout-tab-toggle").click

    # The edit button should either be disabled or not present for non-GMs
    if has_selector?("#edit-map-button")
      # If the button exists, clicking it should not allow access to delete
      find("#edit-map-button").click

      # Delete button should either be disabled or not present
      if has_selector?("#delete_map_button_map")
        assert_selector "#delete_map_button_map.btn-disabled"
      else
        assert_no_selector "#delete_map_button_map"
      end
    else
      # Or the edit button shouldn't exist at all for non-GMs
      assert_no_selector "#edit-map-button"
    end
  end

  test "should show map details to both GM and players" do
    login_as_player
    visit maps_url
    ensure_logged_in_as_player

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@shared_map.id}']").click

    # Wait for the play button to become enabled
    assert_selector "[data-id='play-map']:not(.btn-disabled)"

    # Click the play button
    find("[data-id='play-map']").click

    # Wait for map details page to load - players should be able to view
    assert_current_path map_path(@shared_map)
  end

  test "should allow GM to access all map management features" do
    login_as_gm
    visit maps_url
    ensure_logged_in_as_gm

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@gm_map.id}']").click

    # GM should see all management buttons enabled
    assert_selector "[data-id='edit-map']:not(.btn-disabled)"
    assert_selector "[data-id='play-map']:not(.btn-disabled)"

    # Navigate to play mode
    find("[data-id='play-map']").click
    assert_selector "#controls"

    # Open fly-out
    find("#flyout-tab-toggle").click

    # GM should see edit button in play mode
    assert_selector "#edit-map-button"
  end

  test "should handle permission errors gracefully" do
    login_as_player

    # Try to directly access actions that require GM permissions
    visit edit_map_path(@gm_map)

    # Should handle the unauthorized access gracefully
    # This could be a redirect to maps index, login page, or error message
    # Adjust based on your implementation
    assert_no_selector "[data-testid='map-form']" # Should not show the edit form
  end
end
