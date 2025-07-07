Rails.application.configure do
  config.middleware.use OmniAuth::Builder do
    if Rails.application.credentials.google.present?
      provider :google_oauth2,
               Rails.application.credentials.google[:client_id],
               Rails.application.credentials.google[:client_secret],
               {
                 scope: "email,profile",
                 prompt: "select_account"
               }
    end
  end
end
