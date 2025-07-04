class UsersController < ApplicationController
  include Authentication
  allow_unauthenticated_access only: [ :new, :create ]

  def new
    @user = User.new
  end

  def create
    user = User.new(params.require(:user).permit(:email_address, :password, :password_confirmation))
    if user.save
      start_new_session_for user
      redirect_to maps_path, notice: "User was successfully created."
    else
      render :new
    end
  end

  def update
    # Find the user being updated
    @user = User.find(params[:id])

    # Authentication check - ensure current user can only update their own account
    unless current_user && current_user.id == @user.id
      redirect_to root_path, alert: "You can only edit your own account."
      return
    end

    # Verify current password if provided
    if params[:current_password].present?
      unless @user.authenticate(params[:current_password])
        @user.errors.add(:current_password, "is incorrect")
        render :edit, status: :unprocessable_entity
        return
      end
    else
      @user.errors.add(:current_password, "is required")
      render :edit, status: :unprocessable_entity
      return
    end

    # Update user with permitted parameters
    if @user.update(user_params)
      redirect_to edit_user_path(@user), notice: "Profile updated successfully!"
    else
      render :edit, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path, alert: "User not found."
  end

  def edit
    # Find the user being edited
    @user = User.find(params[:id])

    # Authentication check - ensure current user can only edit their own account
    unless current_user && current_user.id == @user.id
      redirect_to root_path, alert: "You can only edit your own account."
      nil
    end
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path, alert: "User not found."
  end

private

  def user_params
    # Only permit email and password fields for now
    permitted_params = params.require(:user).permit(:email_address, :password, :password_confirmation)

    # Remove password fields if they're blank (user doesn't want to change password)
    if permitted_params[:password].blank?
      permitted_params.delete(:password)
      permitted_params.delete(:password_confirmation)
    end

    permitted_params

    # TODO: Expand user_params when user preferences are added
    # Future parameters to add:
    # :name, :username, :bio, :theme_preference, :email_notifications,
    # :auto_save_maps, :show_grid_default, :public_profile, :default_map_size,
    # :default_map_theme, :allow_public_maps, :show_online_status, :allow_friend_requests
  end
end
