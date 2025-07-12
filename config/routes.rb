Rails.application.routes.draw do
  resources :maps do
    resources :regions, only: [ :create, :update, :destroy ] do
      collection do
        delete :bulk_destroy
      end
    end
    resources :hexes, only: [ :create, :update ] do
      collection do
        post "bulk_create"
        post "bulk_update"
        post "bulk_replace"
      end
      member do
        post :assign_resource
        delete :unassign_resource
      end
    end
    resources :resources, only: [ :create, :update, :destroy ]
    member do
      patch :update_hex_labels
      get :preview
    end
    resources :player_maps, only: [ :create, :update, :destroy ]
  end
  resource :session
  resources :passwords, param: :token
  resources :users, only: [ :new, :create, :update, :edit, :destroy ]
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  post "/join_map", to: "player_maps#join_by_token"
  get "/preview_by_link", to: "maps#preview_by_link"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # OAuth routes
  get "/auth/:provider/callback", to: "sessions#omniauth"
  post "/auth/:provider/callback", to: "sessions#omniauth"
  get "/auth/failure", to: "sessions#auth_failure"

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "pages#index"
end
