import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static values = { isEdit: Boolean }

    connect() {
        const form = this.element;
        const nameField = form.querySelector('#map_name');
        const descriptionField = form.querySelector('#map_description');
        const imageField = form.querySelector('#map_image');

        // File type validation
        imageField.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Please select a JPG or PNG image file.');
                    e.target.value = '';
                }
            }
        });

        // Form submission validation
        form.addEventListener('submit', (e) => {
            let isValid = true;

            // Reset error states
            [nameField, descriptionField, imageField].forEach(field => {
                field.classList.remove('input-error', 'textarea-error', 'file-input-error');
            });

            // Validate name
            if (!nameField.value.trim()) {
                nameField.classList.add('input-error');
                isValid = false;
            }

            // Validate description
            if (!descriptionField.value.trim()) {
                descriptionField.classList.add('textarea-error');
                isValid = false;
            }

            // Validate image - only required for new maps or if no image is currently attached
            const imageRequired = !this.isEditValue || !this.hasExistingImage();

            if (imageRequired && !imageField.files.length) {
                imageField.classList.add('file-input-error');
                isValid = false;
            } else if (imageField.files.length > 0) {
                // If a file is selected, validate its type
                const file = imageField.files[0];
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!allowedTypes.includes(file.type)) {
                    imageField.classList.add('file-input-error');
                    isValid = false;
                }
            }

            if (!isValid) {
                e.preventDefault();
                // Scroll to first error
                const firstError = form.querySelector('.input-error, .textarea-error, .file-input-error');
                if (firstError) {
                    firstError.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
            }
        });
    }

    // Helper method to check if there's an existing image
    hasExistingImage() {
        return this.element.querySelector('.avatar img') !== null;
    }
}