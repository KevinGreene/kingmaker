class CreatePlayerMaps < ActiveRecord::Migration[8.0]
  def change
    create_table :player_maps do |t|
      t.references :player, null: false, foreign_key: true
      t.references :map, null: false, foreign_key: true
      t.boolean :gm

      t.timestamps
    end
  end
end
