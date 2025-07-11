require "application_system_test_case"

class MapsTest < ApplicationSystemTestCase
  setup do
    @gm_user = users(:one)  # This user will be the GM
    @player_user = users(:two)  # This user will be a regular player

    # Map and player associations are set up in fixtures
    @gm_map = maps(:one)
    @player_map = maps(:two)
    @shared_map = maps(:three)
    @abandoned_map = maps(:four)
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
    @abandoned_map.image.attach(io: File.open(Rails.root.join("test", "fixtures", "files", "test_image.png")),
      filename: "test_image.png",
      content_type: "image/png"
    )
    @abandoned_map.save!
    @abandoned_map.reload
  end

  def teardown
    reset_session! if respond_to?(:reset_session!)
    Capybara.reset_sessions!
    super
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

  test "should edit map as GM" do
    login_as_gm
    visit maps_url
    ensure_logged_in_as_gm

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@gm_map.id}']").click

    # Click the edit button
    find("[data-id='edit-map']").click

    # Now we should be on the edit form page
    assert_current_path edit_map_path(@gm_map)
    click_button "Edit Details"

    # Edit map modal now appears
    assert_text "Edit Map Details"
    fill_in "map[name]", with: "Updated #{@gm_map.name}"
    fill_in "map[description]", with: "Updated description for #{@gm_map.name}"
    click_button "Update Map Details"

    # Check for success message and new map name
    assert_text "Map was successfully updated"
    assert_text "Updated #{@gm_map.name}"
  end

  test "should not allow player to edit map" do
    login_as_player
    visit maps_url
    ensure_logged_in_as_player

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Attempt to edit a map in the list
    find("[data-testid='map-card-#{@player_map.id}']").click
    assert_selector '[data-id="edit-map"].btn-disabled'
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

    # Click the edit button
    find("[data-id='edit-map']").click

    # Now we should be on the edit form page
    assert_current_path edit_map_path(@gm_map)
    click_button "Edit Details"

    # Fill out form with new image
    fill_in "map[name]", with: "Updated #{@gm_map.name}"
    fill_in "map[description]", with: "Updated description with new image"

    # Attach a new test image
    attach_file "map[image]", Rails.root.join("test", "fixtures", "files", "test_replacement_image.jpg")

    click_button "Update Map Details"

    # After update, UI message indicating a successful update
    assert_text "Map was successfully updated"
    assert_current_path edit_map_path(@gm_map)
  end

  test "should destroy map as GM owner" do
    login_as_gm
    visit maps_url
    ensure_logged_in_as_gm

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Edit a map
    find("[data-testid='map-card-#{@gm_map.id}']").click
    find("[data-id='edit-map']").click

    # Click on Delete and confirm in the modal
    click_button "Delete Map"
    click_button "Yes, delete this map"

    # Wait for redirect to maps index
    assert_current_path maps_path
  end

  test "should show map details to both GM and players" do
    login_as_player
    visit maps_url
    ensure_logged_in_as_player

    # Wait for javascript to be loaded:
    assert_selector "[data-controller='maps']"

    # Click on a map in the list to select it
    find("[data-testid='map-card-#{@shared_map.id}']").click

    # Click the play button
    find("[data-id='play-map']").click

    # Wait for map details page to load - players should be able to view
    assert_current_path map_path(@shared_map)
  end

  test "should handle permission errors gracefully" do
    login_as_player
    visit maps_path
    ensure_logged_in_as_player

    # Try to directly access actions that require GM permissions
    visit edit_map_path(@gm_map)

    # Should handle the unauthorized access gracefully - either go to login screen or show an error on maps page
    assert(
      has_text?("Only GMs can edit this map.") || current_path == new_session_path,
      "Expected either permission error message or redirect to login, but got neither"
    )
    assert_current_path maps_path unless current_path == new_session_path
  end

  test "should preview map without auth" do
    page.driver.browser.manage.delete_all_cookies
    visit maps_url
    assert_current_path(new_session_path)
    click_link("← Back to Home")
    click_button("Join Now")

    assert_selector "[data-controller='map-link']"

    fill_in "map-link-input", with: "map_unique_token_4"

    within("#join_modal") do
      click_button("Accept")
    end

    assert_text(@abandoned_map.name)
  end
end
