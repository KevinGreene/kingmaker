class AddShareTokenToMaps < ActiveRecord::Migration[8.0]
  def change
    add_column :maps, :share_token, :string
    add_index :maps, :share_token, unique: true
  end
end
