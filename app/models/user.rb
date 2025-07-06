class User < ApplicationRecord
  has_secure_password
  has_one :player, dependent: :destroy
  has_many :sessions, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  after_create :create_player_record

  private

  def create_player_record
    Player.create!(
      user_id: self.id
    )
  end
end
