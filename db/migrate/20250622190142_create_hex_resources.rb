class CreateHexResources < ActiveRecord::Migration[8.0]
  def change
    create_table :hex_resources do |t|
      t.references :hex, null: false, foreign_key: true
      t.references :resource, null: false, foreign_key: true

      t.timestamps
    end
  end
end
