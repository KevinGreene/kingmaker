class UpdateHexesRegionForeignKey < ActiveRecord::Migration[8.0]
  def change
    # Remove the existing foreign key
    remove_foreign_key :hexes, :regions

    # Add it back with on_delete: :nullify
    add_foreign_key :hexes, :regions, on_delete: :nullify
  end
end
