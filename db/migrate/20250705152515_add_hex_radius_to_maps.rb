class AddHexRadiusToMaps < ActiveRecord::Migration[8.0]
  def change
    add_column :maps, :hex_radius, :decimal, precision: 8, scale: 2
  end
end
