class ChangeHexScaleToXyInMaps < ActiveRecord::Migration[8.0]
  def change
    remove_column :maps, :hex_scale
    add_column :maps, :hex_scale_x, :decimal
    add_column :maps, :hex_scale_y, :decimal
  end
end
