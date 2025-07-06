class MapsController < ApplicationController
  before_action :set_map, only: %i[ show edit update destroy update_hex_labels preview ]

  # GET /maps or /maps.json
  def index
    @maps = Map.all
  end

  # GET /maps/1 or /maps/1.json
  def show
    @map = Map.find(params[:id])
    @player = current_user.player
  end

  # GET /maps/new
  def new
    @map = Map.new
  end

  # GET /maps/1/edit
  def edit
  end

  # POST /maps or /maps.json
  def create
    @map = Map.new(map_params)

    respond_to do |format|
      if @map.save
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
        format.html { redirect_to @map, notice: "Map was successfully updated." }
        format.json { render :show, status: :ok, location: @map }
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
    end

    # Only allow a list of trusted parameters through.
    def map_params
      params.expect(map: [ :name, :description, :image, :columns, :rows, :hex_radius ])
    end
end
