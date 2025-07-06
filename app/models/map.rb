class Map < ApplicationRecord
  has_one_attached :image
  has_many :hexes, dependent: :destroy
  has_many :regions, dependent: :destroy
  has_many :notes, dependent: :destroy
  has_many :kingdoms, dependent: :destroy
  has_many :player_maps, dependent: :destroy
  has_many :hex_notes, through: :hexes, source: :notes

  def create_initial_hexes
    return if hexes.exists?
    # Create a grid of hexes for the map
    (0..columns).each do |x|
      (0..rows).each do |y|
        hexes.create(x_coordinate: x, y_coordinate: y, label: "Hex #{x},#{y}", reconnoitered: false, claimed: false, visible: true)
      end
    end
  end

  private
    def image_format
      return unless image.attached?
      unless image.content_type.in?(%w[image/jpeg image/jpg image/png])
        errors.add(:image, "must be a JPG or PNG file")
      end
    end
end
