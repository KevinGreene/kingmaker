class HexesController < ApplicationController
  before_action :set_map_and_hex, only: [ :update ]
  before_action :set_map, only: [ :bulk_create ]
  before_action :validate_gm_access, only: [ :bulk_create ]

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
    hex_ids = params[:hex_ids]
    updates = params[:updates]

    begin
      Hex.transaction do
        hexes = Hex.where(id: hex_ids, map_id: params[:map_id])

        # Convert permitted parameters to hash
        permitted_updates = updates.permit(:region_id).to_h
        hexes.update_all(permitted_updates)

        # Return updated hexes
        updated_hexes = hexes.reload
        render json: { success: true, hexes: updated_hexes }
      end
    rescue => e
      render json: { success: false, error: e.message }, status: 422
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
