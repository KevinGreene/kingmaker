class MapsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [ :preview_by_link ]
  allow_unauthenticated_access only: [ :preview_by_link, :show ]

  before_action :set_map, only: %i[ show edit update destroy update_hex_labels preview ]
  before_action :validate_player_access, only: %i[ show preview ]
  before_action :validate_gm_access, only: %i[ edit update destroy update_hex_labels ]
  skip_before_action :validate_player_access, only: [ :preview_by_link ]
  skip_before_action :validate_gm_access, only: [ :preview_by_link ]

  # GET /maps or /maps.json
  def index
    # Only show maps where the current user is a player
    @maps = Map.joins(:player_maps)
               .where(player_maps: { player_id: current_user.player.id })
               .distinct
  end

  # GET /maps/1 or /maps/1.json
  def show
    @map = Map.find(params[:id])

    if params[:share_token].present?
      # Share token access - verify token matches
      unless @map.share_token == params[:share_token]
        redirect_to root_path, alert: "Invalid share token for this map"
        return
      end
      @player = nil
    else
      # Normal access - user must be authenticated (enforced by validate_player_access)
      @player = current_user.player
    end
  end

  # GET /maps/new
  def new
    @map = Map.new
  end

  # GET /maps/1/edit
  def edit
    if current_user&.player
      @player = current_user.player
    end
  end

  # POST /maps or /maps.json
  def create
    @map = Map.new(map_params)
    respond_to do |format|
      if @map.save
        # Automatically add the creator as a GM for this map
        PlayerMap.create!(
          player_id: current_user.player.id,
          map_id: @map.id,
          gm: true
        )

        # Generate hexes based on rows and columns
        @map.rows.times do |row|
          @map.columns.times do |col|
            Hex.create!(
              map_id: @map.id,
              y_coordinate: row,
              x_coordinate: col,
              reconnoitered: false,
              claimed: false,
              visible: true
            )
          end
        end

        format.html { redirect_to @map, notice: "Map was successfully created." }
        format.json { render :show, status: :created, location: @map }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @map.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /maps/1 or /maps/1.json
  def update
    respond_to do |format|
      if @map.update(map_params)
        format.html { redirect_to edit_map_path(@map), notice: "Map was successfully updated." }
        format.json { render json: @map, status: :ok }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @map.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /maps/1 or /maps/1.json
  def destroy
    @map.destroy!

    respond_to do |format|
      format.html { redirect_to maps_path, status: :see_other, notice: "Map was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def preview
    respond_to do |format|
      format.html { render layout: false }
    end
  end

  def preview_by_link
    share_token = params[:share_token]
    @map = Map.find_by(share_token: share_token)

    if @map
      render json: { status: "success", map_id: @map.id }
    else
      render json: { status: "error", errors: [ "Invalid share token" ] }
    end
  end

  def update_hex_labels
    @map.hexes.each do |hex|
      hex.update(label: hex.default_label)
    end

    redirect_to @map, notice: "All hex labels updated to default."
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_map
      @map = Map.find(params.expect(:id))
    rescue ActiveRecord::RecordNotFound
      respond_to do |format|
        format.html {
          redirect_to maps_path,
          alert: "The map you're looking for doesn't exist or has been deleted."
        }
        format.json {
          render json: { error: "Map not found" },
          status: :not_found
        }
      end
    end

  def validate_player_access
    # Skip validation if accessing via share token
    return if params[:share_token].present?

    # For normal access, ensure user is authenticated
    unless authenticated?
      request_authentication
      return
    end

    player = current_user.player
    unless PlayerMap.exists?(player_id: player.id, map_id: @map.id)
      respond_to do |format|
        format.html {
          redirect_to maps_path, alert: "You don't have access to this map."
        }
        format.json {
          render json: { error: "Access denied" }, status: :forbidden
        }
      end
    end
  end

  def validate_gm_access
    unless current_player_is_gm_for_map?(@map)
      respond_to do |format|
        format.html {
          redirect_to maps_path, alert: "Only GMs can edit this map."
        }
        format.json {
          render json: { error: "GM access required" }, status: :forbidden
        }
      end
    end
  end

  def map_params
    params.require(:map).permit(
      :name,
      :description,
      :image,
      :image_scale_horizontal,
      :image_scale_vertical,
      :columns,
      :rows,
      :offset_x,
      :offset_y,
      :hex_scale_x,
      :hex_scale_y,
      :hex_radius,
      :is_hex_pointy_top
    )
  end
end
