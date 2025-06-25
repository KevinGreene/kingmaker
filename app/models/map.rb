class Map < ApplicationRecord
  has_one_attached :image
  has_many :hexes, dependent: :destroy
  has_many :regions, dependent: :destroy

  def create_initial_hexes
    return if hexes.exists?
    # Create a grid of hexes for the map
    (0..columns).each do |x|
      (0..rows).each do |y|
        hexes.create(x_coordinate: x, y_coordinate: y, label: "Hex #{x},#{y}", reconnoitered: false, claimed: false, visible: true)
      end
    end
  end
end
