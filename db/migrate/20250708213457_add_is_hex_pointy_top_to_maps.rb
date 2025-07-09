class AddIsHexPointyTopToMaps < ActiveRecord::Migration[8.0]
  def change
    add_column :maps, :is_hex_pointy_top, :boolean, default: false, null: false
  end
end
