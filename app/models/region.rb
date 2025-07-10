class Region < ApplicationRecord
  has_many :hexes, dependent: :nullify
  belongs_to :map
end
