class HexesController < ApplicationController
  before_action :set_map_and_hex, except: [ :bulk_create ]
  before_action :set_map, only: [ :bulk_create ]

  def update
    if @hex.update(hex_params)
      redirect_to @map, notice: "Hex region updated successfully."
    else
      redirect_to @map, alert: "Failed to update hex region."
    end
  end

  def bulk_create
    hex_params = params[:hexes]
    created_hexes = []
    hex_params.each do |hex_data|
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
    render json: {
      success: true,
      message: "#{created_hexes.count} hexes created successfully",
      hexes: created_hexes
    }
  rescue => e
    render json: { success: false, error: e.message }, status: 422
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
    params.require(:hex).permit(:region_id)
  end
end
