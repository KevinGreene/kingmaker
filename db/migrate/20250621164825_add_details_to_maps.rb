class AddDetailsToMaps < ActiveRecord::Migration[8.0]
  def change
    add_column :maps, :columns, :integer
    add_column :maps, :rows, :integer
    add_column :maps, :hex_scale, :float
    add_column :maps, :image_scale_horizontal, :float
    add_column :maps, :image_scale_vertical, :float
    add_column :maps, :offset_x, :integer
    add_column :maps, :offset_y, :integer
  end
end
