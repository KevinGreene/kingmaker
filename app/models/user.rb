class User < ApplicationRecord
  has_secure_password validations: false
  has_one :player, dependent: :destroy
  has_many :sessions, dependent: :destroy

  # Add avatar attachment
  has_one_attached :avatar

  validates :password, presence: true, length: { minimum: 8 }, if: -> { password.present? || (new_record? && provider.blank?) }
  validates :email_address, presence: true, uniqueness: true
  validates :display_name, presence: true, if: :display_name_required?

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
        google_refresh_token: auth.credentials.refresh_token,
        # Update display_name if it's empty or still the default
        display_name: user.display_name.blank? ? (auth.info.name || auth.info.email.split("@").first) : user.display_name
      )
      user.ensure_player_exists
    else
      # Create new user
      user = create!(
        email_address: auth.info.email,
        display_name: auth.info.name || auth.info.email.split("@").first,
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

  def ensure_player_exists
    player || create_player!
  end

  # Method for safe JSON output
  def safe_json_attributes
    {
      id: id,
      display_name: display_name_or_fallback,
      icon: avatar_url
    }
  end

  # Get display name with fallback
  def display_name_or_fallback
    display_name.presence || name.presence || email_address.split("@").first
  end

  # Get avatar URL (prioritize attached avatar, fall back to icon URL)
  def avatar_url
    if avatar.attached?
      Rails.application.routes.url_helpers.rails_blob_url(avatar, only_path: true)
    elsif icon.present?
      icon
    else
      nil
    end
  end

  private

  def create_player_record
    Player.create!(
      user_id: self.id
    )
  end

  def display_name_required?
    # Require for new records
    return true if new_record?

    # Require if display_name is being changed
    return true if display_name_changed?

    # Don't require for existing records with nil display_name
    false
  end
end
