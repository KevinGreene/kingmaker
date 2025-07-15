class PlayerMap < ApplicationRecord
  belongs_to :player
  belongs_to :map
  validates :player_id, uniqueness: { scope: :map_id, message: "can only be added to a map once" }
end
