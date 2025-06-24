class RegionsController < ApplicationController
  before_action :set_map

  def create
    @region = @map.regions.build(region_params)
    
    if @region.save
      redirect_to @map, notice: 'Region was successfully created.'
    else
      redirect_to @map, alert: 'Failed to create region.'
    end
  end

  private

  def set_map
    @map = Map.find(params[:map_id])
  end

  def region_params
    params.require(:region).permit(:name)
  end
end
