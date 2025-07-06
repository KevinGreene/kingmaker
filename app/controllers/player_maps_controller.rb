class PlayerMapsController < ApplicationController
  def create
    @map = Map.find(params[:map_id])
    @player_map = @map.player_maps.build(player_map_params)
    if @player_map.save
      render json: { status: "success", message: "Player added to map" }
    else
      render json: { status: "error", errors: @player_map.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @map = Map.find(params[:map_id])
    @player_map = @map.player_maps.find(params[:id])
    if @player_map.update(player_map_params)
      render json: { status: "success", message: "Player map updated" }
    else
      render json: { status: "error", errors: @player_map.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
  end

  private

  def player_map_params
    params.require(:player_map).permit(:player_id, :gm)
  end
end
