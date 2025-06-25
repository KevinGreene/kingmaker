class HexesController < ApplicationController
  before_action :set_map_and_hex

  def update
    if @hex.update(hex_params)
      redirect_to @map, notice: "Hex region updated successfully."
    else
      redirect_to @map, alert: "Failed to update hex region."
    end
  end

  private

  def set_map_and_hex
    @map = Map.find(params[:map_id])
    @hex = @map.hexes.find(params[:id])
  end

  def hex_params
    params.require(:hex).permit(:region_id)
  end
end
