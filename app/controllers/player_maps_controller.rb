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

  def join_by_token
    @map = Map.find_by(share_token: params[:share_token])

    if @map.nil?
      render json: { status: "error", errors: [ "Invalid map ID" ] }, status: :not_found
      return
    end

    # Check if player is already linked to this map
    existing_player_map = @map.player_maps.find_by(player_id: current_user.player.id)

    if existing_player_map
      render json: { status: "error", errors: [ "You are already linked to this map" ] }, status: :unprocessable_entity
      return
    end

    @player_map = @map.player_maps.build(
      player_id: current_user.player.id,
      gm: false
    )

    if @player_map.save
      render json: {
        status: "success",
        message: "Successfully joined the map!",
        map_id: @map.id
      }
    else
      render json: {
        status: "error",
        errors: @player_map.errors.full_messages
      }, status: :unprocessable_entity
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
    @player_map = PlayerMap.find(params[:id])
    if @player_map.destroy
      head :no_content
    else
      render json: { errors: @player_map.errors }, status: :unprocessable_entity
    end
  end

  private

  def player_map_params
    params.require(:player_map).permit(:player_id, :gm)
  end
end
