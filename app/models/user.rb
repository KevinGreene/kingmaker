class User < ApplicationRecord
  has_secure_password validations: false
  has_one :player, dependent: :destroy
  has_many :sessions, dependent: :destroy

  validates :password, presence: true, length: { minimum: 8 }, if: -> { provider.blank? }
  validates :email_address, presence: true, uniqueness: true

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  after_create :create_player_record

  # OAuth methods
  def self.from_omniauth(auth)
    # First, try to find existing user by email
    user = find_by(email_address: auth.info.email)

    if user
      # Update existing user with OAuth info
      user.update(
        provider: auth.provider,
        uid: auth.uid,
        google_token: auth.credentials.token,
        google_refresh_token: auth.credentials.refresh_token
      )
    else
      # Create new user
      user = create!(
        email_address: auth.info.email,
        name: auth.info.name,
        provider: auth.provider,
        uid: auth.uid,
        google_token: auth.credentials.token,
        google_refresh_token: auth.credentials.refresh_token
      )
    end

    user
  end

  def google_oauth?
    provider == "google_oauth2"
  end

  private

  def create_player_record
    Player.create!(
      user_id: self.id
    )
  end
end
