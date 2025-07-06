class Map < ApplicationRecord
  has_one_attached :image
  has_many :hexes, dependent: :destroy
  has_many :regions, dependent: :destroy
  has_many :notes, dependent: :destroy
  has_many :kingdoms, dependent: :destroy
  has_many :player_maps, dependent: :destroy
  has_many :players, through: :player_maps
  has_many :hex_notes, through: :hexes, source: :notes

  before_create :generate_share_token
  before_validation :generate_share_token, on: :create
  validates :share_token, presence: true, uniqueness: true

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

  def generate_share_token
    loop do
      self.share_token = SecureRandom.urlsafe_base64(16)
      break unless Map.exists?(share_token: share_token)
    end
  end
end
