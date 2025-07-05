class PagesController < ApplicationController
  allow_unauthenticated_access only: [ :index ]
  def index
    # Redirect authenticated users to maps index
    if authenticated?
      redirect_to maps_path
      nil
    end
  end
end
