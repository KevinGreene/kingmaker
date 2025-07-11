class Resource < ApplicationRecord
  belongs_to :map
  has_many :hex_resources, dependent: :destroy
  has_many :hexes, through: :hex_resources

  validates :name, presence: true
  validates :map_id, presence: true
end
