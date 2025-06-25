require "application_system_test_case"

class MapsTest < ApplicationSystemTestCase
  setup do
    @map = maps(:one)

    # authenticate in headless browser using dedicated path
    @user = users(:one)
    visit "/test_login/#{@user.id}"
  end

  test "visiting the index" do
    visit maps_url
    assert_selector "h1", text: "Maps"
  end

  test "should create map" do
    visit maps_url
    click_on "New map"

    fill_in "Name", with: @map.name
    click_on "Create Map"

    assert_text "Map was successfully created"
    click_on "Back"
  end

  test "should update Map" do
    visit map_url(@map)
    click_on "Edit this map", match: :first

    fill_in "Name", with: @map.name
    click_on "Update Map"

    assert_text "Map was successfully updated"
    click_on "Back"
  end

  test "should destroy Map" do
    visit map_url(@map)
    click_on "Destroy this map", match: :first

    assert_text "Map was successfully destroyed"
  end
end
