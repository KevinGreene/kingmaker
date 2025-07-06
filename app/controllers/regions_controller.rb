class RegionsController < ApplicationController
  before_action :set_map
  before_action :validate_gm_access

  def create
    @region = @map.regions.build(region_params)

    if @region.save
      redirect_to @map, notice: "Region was successfully created."
    else
      redirect_to @map, alert: "Failed to create region."
    end
  end

  private

  def validate_gm_access
    unless current_player_is_gm_for_map?(@map)
      respond_to do |format|
        format.html {
          redirect_to @map, alert: "Only GMs can edit regions."
        }
        format.json {
          render json: { error: "GM access required" }, status: :forbidden
        }
      end
    end
  end

  def set_map
    @map = Map.find(params[:map_id])
  end

  def region_params
    params.require(:region).permit(:name)
  end
end
