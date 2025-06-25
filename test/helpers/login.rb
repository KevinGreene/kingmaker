def login_as(user)
  fill_in "email_address", with: user.email_address
  fill_in "password", with: "password"
  click_button "commit"
end
