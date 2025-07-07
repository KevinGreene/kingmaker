class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[ new create omniauth auth_failure ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_session_url, alert: "Try again later." }

  def new
  end

  def create
    if (user = User.authenticate_by(params.permit(:email_address, :password)))
      start_new_session_for user
      redirect_to params[:redirect_to].presence || after_authentication_url
    else
      redirect_to new_session_path, alert: "Try another email address or password."
    end
  end

  def omniauth
    auth = request.env["omniauth.auth"]
    user = User.from_omniauth(auth)

    if user.persisted?
      start_new_session_for user
      redirect_to params[:redirect_to].presence || after_authentication_url
    else
      redirect_to new_session_path, alert: "There was an error with Google authentication."
    end
  end

  def auth_failure
    redirect_to new_session_path, alert: "Authentication failed. Please try again."
  end

  def destroy
    terminate_session
    redirect_to root_path
  end
end
