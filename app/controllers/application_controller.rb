class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # additional configurations that allow test scripts
  # to authenticate through a headless browser
  skip_before_action :require_authentication, only: [ :test_login ]

  def test_login
    return head(:not_found) unless Rails.env.test?
    user = User.find(params[:user_id])
    start_new_session_for(user)
    redirect_to root_path
  end
end
