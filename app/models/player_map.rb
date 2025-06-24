class PlayerMap < ApplicationRecord
  belongs_to :player
  belongs_to :map
end
