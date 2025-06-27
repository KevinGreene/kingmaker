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
    assert_selector "h1", text: "Maps"
  end

  test "should create map" do
    visit maps_url
    if has_field?("email_address") && has_field?("password")
      login_as @user
    end
    click_on "New map"

    fill_in "Name", with: @map.name
    click_on "Create Map"

    assert_text "Map was successfully created"
    click_on "Back"
  end

  test "should update Map" do
    visit map_url(@map)

    if has_field?("email_address") && has_field?("password")
      login_as @user
    end

    click_on "Edit this map", match: :first

    sleep(1)

    puts "\n=== ALL PAGE ELEMENTS DEBUG ==="

    # All input elements with detailed info
    puts "INPUT ELEMENTS:"
    all('input', visible: :all).each_with_index do |input, i|
      puts "  #{i+1}. Type: #{input[:type]} | Name: #{input[:name]} | ID: #{input[:id]} | Value: #{input[:value]} | Visible: #{input.visible?} | Disabled: #{input.disabled?}"
    end

    # All labels
    puts "LABEL ELEMENTS:"
    all('label', visible: :all).each_with_index do |label, i|
      puts "  #{i+1}. For: #{label[:for]} | Text: '#{label.text}' | Visible: #{label.visible?}"
    end

    # All form elements
    puts "FORM ELEMENTS:"
    all('form', visible: :all).each_with_index do |form, i|
      puts "  #{i+1}. Action: #{form[:action]} | Method: #{form[:method]} | ID: #{form[:id]}"
    end

    # All select elements
    puts "SELECT ELEMENTS:"
    all('select', visible: :all).each_with_index do |select, i|
      puts "  #{i+1}. Name: #{select[:name]} | ID: #{select[:id]} | Visible: #{select.visible?} | Disabled: #{select.disabled?}"
    end

    # All textarea elements
    puts "TEXTAREA ELEMENTS:"
    all('textarea', visible: :all).each_with_index do |textarea, i|
      puts "  #{i+1}. Name: #{textarea[:name]} | ID: #{textarea[:id]} | Visible: #{textarea.visible?} | Disabled: #{textarea.disabled?}"
    end

    puts "=== END DEBUG ===\n"

    fill_in "map_name", with: @map.name
    click_on "Update Map"

    assert_text "Map was successfully updated"
    click_on "Back"
  end

  test "should destroy Map" do
    visit map_url(@map)

    if has_field?("email_address") && has_field?("password")
      login_as @user
    end

    click_on "Destroy this map", match: :first

    assert_text "Map was successfully destroyed"
  end
end
