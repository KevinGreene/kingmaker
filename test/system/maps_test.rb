require "application_system_test_case"

class MapsTest < ApplicationSystemTestCase
  setup do
    @map = maps(:one)
    @user = users(:one)
    visit new_session_url
    login_as @user
  end

  test "visiting the index" do
    visit maps_url
    if has_field?("email_address") && has_field?("password")
      login_as @user
    end

    # Wait for the form to be ready
    assert_selector "main", wait: 10

    assert_selector "h1", text: "Maps"
  end

  test "should create map" do
    visit maps_url
    if has_field?("email_address") && has_field?("password")
      login_as @user
    end

    click_on "New map"

    # Wait for the form to be ready
    assert_selector "main", wait: 10

    fill_in "map_name", with: @map.name
    click_on "Create Map"

    # Wait for the form to be ready
    assert_selector "main", wait: 10

    assert_text "Map was successfully created"
    click_on "Back"
  end

  test "should update Map" do
    visit map_url(@map)

    if has_field?("email_address") && has_field?("password")
      login_as @user
    end

    click_on "Edit this map", match: :first

    # Wait for the form to be ready
    assert_selector "main", wait: 10

    fill_in "map_name", with: @map.name
    click_on "Update Map"

    # Wait for the form to be ready
    assert_selector "main", wait: 10

    assert_text "Map was successfully updated"
    click_on "Back"
  end

  test "should destroy Map" do
    visit map_url(@map)

    if has_field?("email_address") && has_field?("password")
      login_as @user
    end

    click_on "Destroy this map", match: :first

    # Wait for the form to be ready
    assert_selector "h1", text: "Maps", wait: 10

    assert_text "Map was successfully destroyed"
  end
end
