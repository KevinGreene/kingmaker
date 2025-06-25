require "test_helper"

class MapsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @map = maps(:one)
    @user = users(:one)

    post session_path, params: {
      email_address: @user.email_address,
      password: 'password'
    }

  end

  test "should get index" do
    get maps_url
    assert_response :success
  end

  test "should get new" do
    get new_map_url
    assert_response :success
  end

  test "should create map" do
    assert_difference("Map.count") do
      post maps_url, params: { map: { name: @map.name } }
    end

    assert_redirected_to map_url(Map.last)
  end

  test "should show map" do
    get map_url(@map)
    assert_response :success
  end

  test "should get edit" do
    get edit_map_url(@map)
    assert_response :success
  end

  test "should update map" do
    patch map_url(@map), params: { map: { name: @map.name } }
    assert_redirected_to map_url(@map)
  end

  test "should destroy map" do
    assert_difference("Map.count", -1) do
      delete map_url(@map)
    end

    assert_redirected_to maps_url
  end
end
