class AddOauthToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :provider, :string
    add_column :users, :uid, :string
    add_column :users, :google_token, :string
    add_column :users, :google_refresh_token, :string
    add_index :users, [ :provider, :uid ], unique: true
  end
end
