class CreateHexes < ActiveRecord::Migration[8.0]
  def change
    create_table :hexes do |t|
      t.integer :x_coordinate
      t.integer :y_coordinate
      t.string :label
      t.boolean :reconnoitered
      t.boolean :claimed
      t.boolean :visible
      t.references :map, null: false, foreign_key: true

      t.timestamps
    end
  end
end
