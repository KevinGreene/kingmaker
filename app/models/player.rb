class Player < ApplicationRecord
  belongs_to :user
  has_many :player_maps
  has_many :maps, through: :player_maps
end
