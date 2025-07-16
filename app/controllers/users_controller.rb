class UsersController < ApplicationController
  include Authentication
  allow_unauthenticated_access only: [ :new, :create ]

  def new
    @user = User.new
  end

  def create
    @user = User.new(params.require(:user).permit(:email_address, :password, :password_confirmation, :display_name))
    if @user.save
      start_new_session_for @user
      redirect_to maps_path, notice: "User was successfully created."
    else
      render :new
    end
  end

  def update
    @user = User.find(params[:id])

    unless current_user && current_user.id == @user.id
      redirect_to root_path, alert: "You can only edit your own account."
      return
    end

    # Handle avatar cropping BEFORE processing user_params
    handle_avatar_update if params[:user][:cropped_avatar].present?

    # Skip password verification for OAuth users
    unless @user.google_oauth?
      puts "incorrectly routing to this section"
      if params[:current_password].present? && params[:new_password].present?
        unless @user.authenticate(params[:current_password])
          @user.errors.add(:current_password, "is incorrect")
          render :edit, status: :unprocessable_entity
          return
        end
      end
    end

    if @user.update(user_params)
      puts "user has been updated"
      redirect_to root_path, notice: "Profile updated successfully!"
    else
      puts "something went wrong:"
      puts @user.errors.full_messages # Keep this for debugging
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
    # Include the new fields, exclude cropped_avatar as it's handled separately
    permitted_params = params.require(:user).permit(:email_address, :password, :password_confirmation, :display_name, :icon)

    # Remove password fields if they're blank (user doesn't want to change password)
    if permitted_params[:password].blank?
      permitted_params.delete(:password)
      permitted_params.delete(:password_confirmation)
    end

    permitted_params
  end

  def handle_avatar_update
    cropped_data = params[:user][:cropped_avatar]

    if cropped_data == "REMOVE"
      # Remove the avatar
      @user.avatar.purge if @user.avatar.attached?
      @user.update_column(:icon, nil) # Also clear the icon URL
    elsif cropped_data.present? && cropped_data.start_with?("data:image")
      # Process the cropped image
      begin
        # Decode the base64 image
        image_data = cropped_data.split(",")[1]
        decoded_image = Base64.decode64(image_data)

        # Create a temporary file
        temp_file = Tempfile.new([ "avatar", ".jpg" ])
        temp_file.binmode
        temp_file.write(decoded_image)
        temp_file.rewind

        # Attach the file to the user
        @user.avatar.attach(
          io: temp_file,
          filename: "avatar_#{@user.id}_#{Time.current.to_i}.jpg",
          content_type: "image/jpeg"
        )

        # Clear the icon URL since we're now using uploaded avatar
        @user.update_column(:icon, nil)

      ensure
        temp_file.close if temp_file
        temp_file.unlink if temp_file
      end
    end
  end
end
