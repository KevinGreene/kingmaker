class Region < ApplicationRecord
  has_many :hexes
  belongs_to :map
end
