class AddDisplayNameAndIconToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :display_name, :string, null: false, default: ''
    add_column :users, :icon, :string

    # Add index on display_name for performance (searches, sorting)
    add_index :users, :display_name
  end
end
