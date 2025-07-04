Rails.application.routes.draw do
  resources :maps do
    resources :regions, only: [ :create ]
    resources :hexes, only: [ :update ] do
      collection do
        post "bulk_create"
        post "bulk_replace"
      end
    end
    member do
      patch :update_hex_labels
      get :preview
    end
  end
  resource :session
  resources :passwords, param: :token
  resources :users, only: [ :new, :create, :update, :edit, :destroy ]
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "pages#index"
end
