class MapRenderJob < ApplicationJob
  queue_as :default

  def perform(map_id)
    map = Map.includes(:hexes, hexes: :region).find(map_id)

    Rails.logger.info "Starting map render for Map #{map_id}"
    start_time = Time.current

    renderer = MapRenderer.new(map)
    result = renderer.render_complete_map

    if result
      duration = Time.current - start_time
      Rails.logger.info "Map #{map_id} rendered successfully in #{duration.round(2)}s: #{result}"

      # No database changes needed - just log success
      broadcast_map_update(map)
    else
      Rails.logger.error "Failed to render Map #{map_id}"
    end
  end

  private

  def broadcast_map_update(map)
    Rails.logger.info "Would broadcast map update for Map #{map.id}"
  end
end
