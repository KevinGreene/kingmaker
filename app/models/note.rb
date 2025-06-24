class Note < ApplicationRecord
  belongs_to :player
  belongs_to :hex, optional: true
  belongs_to :map
end
