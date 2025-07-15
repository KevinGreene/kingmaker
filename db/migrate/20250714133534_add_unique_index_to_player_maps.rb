class AddUniqueIndexToPlayerMaps < ActiveRecord::Migration[8.0]
  def up
    # Remove duplicate PlayerMap entries, keeping only the first occurrence
    duplicate_groups = PlayerMap.group(:player_id, :map_id).having('COUNT(*) > 1').pluck(:player_id, :map_id)

    duplicate_groups.each do |player_id, map_id|
      # Get all PlayerMaps for this player/map combination
      player_maps = PlayerMap.where(player_id: player_id, map_id: map_id).order(:created_at)

      # Keep the first one (oldest), delete the rest
      player_maps.offset(1).destroy_all
    end

    # Now add the unique index
    add_index :player_maps, [ :player_id, :map_id ], unique: true
  end

  def down
    remove_index :player_maps, [ :player_id, :map_id ]
  end
end
