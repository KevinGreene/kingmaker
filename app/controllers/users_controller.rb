class UsersController < ApplicationController
  allow_unauthenticated_access

  def new
    @user = User.new
  end

  def create
    user = User.new(params.require(:user).permit(:email_address, :password, :password_confirmation))
    if user.save
      start_new_session_for user
      redirect_to maps_path, notice: 'User was successfully created.'
    else
      render :new
    end
  end
end