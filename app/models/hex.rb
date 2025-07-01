class Hex < ApplicationRecord
  belongs_to :map
  belongs_to :region, optional: true
  has_many :hex_resources, dependent: :destroy
  has_many :resources, through: :hex_resources
  has_many :notes, dependent: :destroy

  validates :x_coordinate, :y_coordinate, presence: true
  validates :x_coordinate, :y_coordinate, numericality: { greater_than_or_equal_to: 0 }

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
