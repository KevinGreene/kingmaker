class ResourcesController < ApplicationController
  before_action :set_map
  before_action :set_resource, only: [ :update, :destroy ]

  def create
    @resource = @map.resources.build(resource_params)

    if @resource.save
      render json: { success: true, resource: @resource }, status: :created
    else
      render json: { success: false, errors: @resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @resource.update(resource_params)
      render json: { success: true, resource: @resource }
    else
      render json: { success: false, errors: @resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @resource.destroy
    render json: { success: true }
  end

  private

  def set_map
    @map = Map.find(params[:map_id])
  end

  def set_resource
    @resource = @map.resources.find(params[:id])
  end

  def resource_params
    params.require(:resource).permit(:name, :description)
  end
end
