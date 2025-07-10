class HexesController < ApplicationController
  before_action :set_map_and_hex, only: [ :update ]
  before_action :set_map, only: [ :bulk_create, :bulk_update ]
  before_action :validate_gm_access, only: [ :bulk_create, :bulk_update ]

  def update
    if @hex.update(hex_params)
      render json: {
        success: true,
        message: "Hex updated successfully",
        hex: @hex
      }
    else
      render json: {
        success: false,
        errors: @hex.errors.full_messages
      }, status: 422
    end
  rescue => e
    render json: { success: false, error: e.message }, status: 422
  end

  def bulk_create
    ActiveRecord::Base.transaction do
      # Get current hexes for comparison
      current_hexes = @map.hexes.index_by { |hex| [ hex.x_coordinate, hex.y_coordinate ] }
      processed_coordinates = Set.new
      created_hexes = []
      updated_hexes = []

      # Process each hex in the payload
      params[:hexes].each do |hex_data|
        coordinates = [ hex_data[:x_coordinate], hex_data[:y_coordinate] ]
        processed_coordinates.add(coordinates)

        existing_hex = current_hexes[coordinates]

        if existing_hex
          # Update existing hex if data has changed
          hex_attributes = {
            reconnoitered: hex_data[:reconnoitered],
            claimed: hex_data[:claimed],
            visible: hex_data[:visible],
            region_id: hex_data[:region_id]
          }

          if existing_hex.attributes.slice(*hex_attributes.keys.map(&:to_s)) != hex_attributes.stringify_keys
            existing_hex.update!(hex_attributes)
            updated_hexes << existing_hex
          end
        else
          # Create new hex
          hex = @map.hexes.create!(
            x_coordinate: hex_data[:x_coordinate],
            y_coordinate: hex_data[:y_coordinate],
            reconnoitered: hex_data[:reconnoitered],
            claimed: hex_data[:claimed],
            visible: hex_data[:visible],
            region_id: hex_data[:region_id]
          )
          created_hexes << hex
        end
      end

      # Delete hexes that weren't in the payload
      hexes_to_delete = current_hexes.keys - processed_coordinates.to_a
      if hexes_to_delete.any?
        deleted_count = @map.hexes.where(
          hexes_to_delete.map { |coords|
            "(x_coordinate = #{coords[0]} AND y_coordinate = #{coords[1]})"
          }.join(" OR ")
        ).delete_all
      else
        deleted_count = 0
      end

      render json: {
        success: true,
        message: "Bulk operation completed successfully",
        created_count: created_hexes.count,
        updated_count: updated_hexes.count,
        deleted_count: deleted_count,
        total_hexes: @map.hexes.count
      }
    end
  rescue => e
    render json: { success: false, error: e.message }, status: 422
  end

  def bulk_update
    # Validate and sanitize input parameters
    hex_ids = Array(params[:hex_ids]).map(&:to_i).reject(&:zero?)
    map_id = params[:map_id].to_i
    region_id = params.dig(:updates, :region_id)

    # Validate required parameters
    if hex_ids.empty? || map_id.zero?
      render json: { success: false, error: "Invalid parameters" }, status: 400
      return
    end

    # Validate region_id if provided (allow null for unassigning)
    if region_id.present?
      region_id = region_id.to_i
      unless Region.exists?(id: region_id, map_id: map_id)
        render json: { success: false, error: "Invalid region" }, status: 400
        return
      end
    else
      region_id = nil
    end

    begin
      Hex.transaction do
        # Use parameterized queries - Rails will properly escape these
        hexes = Hex.where(id: hex_ids, map_id: map_id)

        if hexes.empty?
          render json: { success: false, error: "No hexes found to update" }, status: 404
          return
        end

        # Explicitly build the update hash with validated values
        update_attributes = { region_id: region_id }

        # Use update_all with our sanitized hash
        hexes.update_all(update_attributes)

        # Return updated hexes
        updated_hexes = hexes.reload
        render json: { success: true, hexes: updated_hexes, count: updated_hexes.count }
      end
    rescue => e
      render json: { success: false, error: "Update failed" }, status: 422
    end
  end

  private

  def set_map_and_hex
    @map = Map.find(params[:map_id])
    @hex = @map.hexes.find(params[:id])
  end

  def set_map
    @map = Map.find(params[:map_id])
  end

  def hex_params
    params.require(:hex).permit(:reconnoitered, :claimed, :visible, :region_id)
  end

  def validate_gm_access
    unless current_player_is_gm_for_map?(@map)
      respond_to do |format|
        format.html {
          redirect_to @map, alert: "Only GMs can edit hexes."
        }
        format.json {
          render json: { error: "GM access required" }, status: :forbidden
        }
      end
    end
  end
end
