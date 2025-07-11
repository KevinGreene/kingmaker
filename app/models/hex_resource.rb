class HexResource < ApplicationRecord
  belongs_to :hex
  belongs_to :resource

  validates :hex_id, uniqueness: { scope: :resource_id }
end
