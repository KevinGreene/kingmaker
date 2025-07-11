class AddMapIdToResources < ActiveRecord::Migration[8.0]
  def change
    add_reference :resources, :map, null: false, foreign_key: true
  end
end
