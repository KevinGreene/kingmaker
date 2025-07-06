class BackfillMapShareTokens < ActiveRecord::Migration[8.0]
  def up
    Map.where(share_token: nil).find_each do |map|
      loop do
        token = SecureRandom.urlsafe_base64(16)
        break if map.update_column(:share_token, token) unless Map.exists?(share_token: token)
      end
    end
  end

  def down
    # Could clear tokens if needed for rollback
    # Map.update_all(share_token: nil)
  end
end
