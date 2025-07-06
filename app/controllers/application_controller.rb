class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  private

  # Single source of truth for GM authorization
  def player_is_gm_for_map?(player, map)
    return false unless player && map
    PlayerMap.exists?(player: player, map: map, gm: true)
  end

  # Convenience method for current user
  def current_player_is_gm_for_map?(map)
    player_is_gm_for_map?(current_user.player, map)
  end

  # Make both methods available in views
  helper_method :player_is_gm_for_map?, :current_player_is_gm_for_map?

end
