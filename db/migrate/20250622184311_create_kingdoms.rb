class CreateKingdoms < ActiveRecord::Migration[8.0]
  def change
    create_table :kingdoms do |t|
      t.integer :ore
      t.integer :food
      t.integer :lumber
      t.integer :luxuries
      t.integer :stone
      t.integer :resource_points
      t.references :map, null: false, foreign_key: true

      t.timestamps
    end
  end
end
