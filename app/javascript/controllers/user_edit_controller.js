import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    toggleEmailEdit() {
        const emailInputField = document.getElementById('email-input-field');
        const emailReadOnlyField = document.getElementById('email-read-only-field');
        const passwordField = document.getElementById('current-password-field');
        const changeBtn = document.getElementById('change-email-btn');
        const passwordInput = document.getElementById('current-password-input');

        if (emailInputField.classList.contains('hidden')) {
            // Enable email editing
            emailInputField.classList.remove('hidden');
            emailInputField.classList.add('input-warning');
            emailReadOnlyField.classList.add('hidden');
            passwordField.style.display = 'block';
            passwordInput.required = true;
            changeBtn.textContent = 'Cancel';
            changeBtn.classList.remove('btn-outline');
            changeBtn.classList.add('btn-error');
        } else {
            // Disable email editing
            emailInputField.classList.add('hidden');
            emailInputField.classList.remove('input-warning');
            emailReadOnlyField.classList.remove('hidden');
            passwordField.style.display = 'none';
            passwordInput.required = false;
            passwordInput.value = '';
            changeBtn.textContent = 'Change Email';
            changeBtn.classList.remove('btn-error');
            changeBtn.classList.add('btn-outline');
        }
    }

    togglePasswordSection() {
        const passwordSection = document.getElementById('change-password-section');
        const toggleBtn = document.getElementById('change-password-toggle');
        const currentPasswordForChange = document.getElementById('current-password-for-change');

        if (passwordSection.style.display === 'none') {
            // Show password section
            passwordSection.style.display = 'block';
            toggleBtn.textContent = 'Cancel Password Change';
            toggleBtn.classList.remove('btn-outline');
            toggleBtn.classList.add('btn-error');
            currentPasswordForChange.name = 'current_password';
            currentPasswordForChange.required = true;
        } else {
            // Hide password section
            passwordSection.style.display = 'none';
            toggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        Change Password
      `;
            toggleBtn.classList.remove('btn-error');
            toggleBtn.classList.add('btn-outline');
            currentPasswordForChange.name = 'current_password_for_change';
            currentPasswordForChange.required = false;
            currentPasswordForChange.value = '';

            // Clear password fields
            document.querySelector('input[name="user[password]"]').value = '';
            document.querySelector('input[name="user[password_confirmation]"]').value = '';
        }
    }
}