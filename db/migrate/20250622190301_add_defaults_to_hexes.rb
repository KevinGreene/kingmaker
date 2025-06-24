class AddDefaultsToHexes < ActiveRecord::Migration[8.0]
  def change
    change_column_default :hexes, :claimed, false
    change_column_default :hexes, :reconnoitered, false
    change_column_default :hexes, :visible, false
  end
end
