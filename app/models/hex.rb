class Hex < ApplicationRecord
  belongs_to :map
  belongs_to :region, optional: true
  has_many :hex_resources, dependent: :destroy
  has_many :resources, through: :hex_resources
  has_many :notes, dependent: :destroy

  def coordinates
    "#{x_coordinate}, #{y_coordinate}"
  end

  def default_label
    if region.present?
      "#{region.name} - Hex #{x_coordinate},#{y_coordinate}"
    else
      "Hex #{x_coordinate},#{y_coordinate}"
    end
  end
end
