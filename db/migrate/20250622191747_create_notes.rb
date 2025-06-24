class CreateNotes < ActiveRecord::Migration[8.0]
  def change
    create_table :notes do |t|
      t.string :content
      t.references :player, null: false, foreign_key: true
      t.boolean :private
      t.references :hex, null: true, foreign_key: true
      t.references :map, null: false, foreign_key: true

      t.timestamps
    end
  end
end
