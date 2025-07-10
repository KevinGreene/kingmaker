class RegionsController < ApplicationController
  before_action :set_map
  before_action :validate_gm_access

  def create
    @region = @map.regions.build(region_params)

    if @region.save
      redirect_to edit_map_path(@map), notice: "Region was successfully created."
    else
      redirect_to edit_map_path(@map), alert: "Failed to create region."
    end
  end

  def bulk_destroy
    region_ids = params[:region_ids] || []

    if region_ids.empty?
      redirect_to edit_map_path(@map), alert: "No regions selected for deletion."
      return
    end

    regions_to_delete = @map.regions.where(id: region_ids)
    deleted_count = regions_to_delete.count

    if regions_to_delete.destroy_all
      redirect_to edit_map_path(@map), notice: "Successfully deleted #{deleted_count} region(s)."
    else
      redirect_to edit_map_path(@map), alert: "Failed to delete regions."
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
