import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    mapId: Number
  }

  static targets = [
    "renameSection",
    "nameInput",
    "saveButton",
    "unsavedModal"
  ]

  connect() {
    this.selectedRegionId = null;
    this.originalRegionName = '';
    this.pendingAction = null;

    // Listen for modal close events
    this.element.addEventListener('close', () => {
      this.performClearSelection();
    });
  }

  selectRegion(event) {
    const regionId = parseInt(event.target.value);
    const regionName = event.target.dataset.regionName;

    // Check if we have unsaved changes
    if (this.hasUnsavedChanges()) {
      // Store the pending selection
      this.pendingAction = () => this.performRegionSelection(regionId, regionName);
      this.unsavedModalTarget.showModal();
      return;
    }

    this.performRegionSelection(regionId, regionName);
  }

  performRegionSelection(regionId, regionName) {
    this.selectedRegionId = regionId;
    this.originalRegionName = regionName;

    // Show the rename section
    this.renameSectionTarget.classList.remove('hidden');

    // Set the input value to current name
    this.nameInputTarget.value = regionName;

    // Clear any existing error state
    this.clearInputError();

    // Focus on the input
    this.nameInputTarget.focus();
  }

  clearSelection() {
    if (this.hasUnsavedChanges()) {
      this.pendingAction = () => this.performClearSelection();
      this.unsavedModalTarget.showModal();
      return;
    }

    this.performClearSelection();
  }

  performClearSelection() {
    this.selectedRegionId = null;
    this.originalRegionName = '';

    // Hide the rename section
    this.renameSectionTarget.classList.add('hidden');

    // Clear the input
    this.nameInputTarget.value = '';

    // Clear any error state
    this.clearInputError();

    // Uncheck all radio buttons
    this.element.querySelectorAll('input[name="selected_region"]').forEach(radio => {
      radio.checked = false;
    });
  }

  closeRenameModal() {
    if (this.hasUnsavedChanges()) {
      this.pendingAction = () => this.getModal().close();
      this.unsavedModalTarget.showModal();
      return;
    }

    this.getModal().close();
  }

  getModal() {
    return this.element.closest('dialog') || document.getElementById('rename_region_modal');
  }

  hasUnsavedChanges() {
    if (!this.selectedRegionId) return false;

    const currentName = this.nameInputTarget.value.trim();
    return currentName !== this.originalRegionName;
  }

  saveRegionName() {
    if (!this.selectedRegionId) {
      this.showError('Please select a region first.');
      return;
    }

    const newName = this.nameInputTarget.value.trim();

    if (!newName) {
      this.showInputError('Please enter a name for the region.');
      return;
    }

    if (newName === this.originalRegionName) {
      this.showInfo('The name is unchanged.');
      return;
    }

    // Clear any existing error state
    this.clearInputError();

    // Disable the save button and show loading
    const originalText = this.saveButtonTarget.textContent;
    this.saveButtonTarget.disabled = true;
    this.saveButtonTarget.textContent = 'Saving...';

    // Make the AJAX request
    fetch(`/maps/${this.mapIdValue}/regions/${this.selectedRegionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: JSON.stringify({
        region: {
          name: newName
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update the display
        const selectedRadio = this.element.querySelector(`input[name="selected_region"][value="${this.selectedRegionId}"]`);
        const labelText = selectedRadio.parentElement.querySelector('.font-medium');
        labelText.textContent = newName;

        // Update our tracking variables
        this.originalRegionName = newName;
        selectedRadio.setAttribute('data-region-name', newName);

        // Show success message
        this.showSuccess('Region renamed successfully!');
      } else {
        this.showInputError('Failed to rename region: ' + (data.errors ? data.errors.join(', ') : 'Unknown error'));
      }
    })
    .catch(error => {
      console.error('Error:', error);
      this.showInputError('An error occurred while renaming the region.');
    })
    .finally(() => {
      // Re-enable the save button
      this.saveButtonTarget.disabled = false;
      this.saveButtonTarget.textContent = originalText;
    });
  }

  discardChanges() {
    this.unsavedModalTarget.close();

    if (this.pendingAction) {
      // Reset the input to original name before executing pending action
      if (this.selectedRegionId) {
        this.nameInputTarget.value = this.originalRegionName;
      }
      this.clearInputError();
      this.pendingAction();
      this.pendingAction = null;
    }
  }

  saveAndContinue() {
    this.unsavedModalTarget.close();

    // Save first, then execute pending action
    const originalPendingAction = this.pendingAction;
    this.pendingAction = null;

    // We'll modify the save process to execute the pending action on success
    this.saveRegionNameAndContinue(originalPendingAction);
  }

  saveRegionNameAndContinue(pendingAction) {
    if (!this.selectedRegionId) {
      this.showError('Please select a region first.');
      return;
    }

    const newName = this.nameInputTarget.value.trim();

    if (!newName) {
      this.showInputError('Please enter a name for the region.');
      return;
    }

    if (newName === this.originalRegionName) {
      if (pendingAction) pendingAction();
      return;
    }

    // Clear any existing error state
    this.clearInputError();

    // Make the AJAX request
    fetch(`/maps/${this.mapIdValue}/regions/${this.selectedRegionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: JSON.stringify({
        region: {
          name: newName
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Update the display
        const selectedRadio = this.element.querySelector(`input[name="selected_region"][value="${this.selectedRegionId}"]`);
        const labelText = selectedRadio.parentElement.querySelector('.font-medium');
        labelText.textContent = newName;

        // Update our tracking variables
        this.originalRegionName = newName;
        selectedRadio.setAttribute('data-region-name', newName);

        // Execute the pending action
        if (pendingAction) pendingAction();
      } else {
        this.showInputError('Failed to rename region: ' + (data.errors ? data.errors.join(', ') : 'Unknown error'));
      }
    })
    .catch(error => {
      console.error('Error:', error);
      this.showInputError('An error occurred while renaming the region.');
    });
  }

  // Toast and error handling methods
  showSuccess(message) {
    this.showToast(message, 'success');
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showInfo(message) {
    this.showToast(message, 'info');
  }

  showInputError(message) {
    // Add error styling to input
    this.nameInputTarget.classList.add('input-error');
    this.nameInputTarget.classList.remove('input-bordered');

    // Show toast
    this.showToast(message, 'error');

    // Focus on the input
    this.nameInputTarget.focus();
  }

  clearInputError() {
    // Remove error styling from input
    this.nameInputTarget.classList.remove('input-error');
    this.nameInputTarget.classList.add('input-bordered');
  }

  showToast(message, type = 'info') {
    const modal = this.getModal();

    // Create toast container if it doesn't exist within this modal
    let toastContainer = modal.querySelector('.modal-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'modal-toast-container toast toast-top toast-center';
      modal.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;

    // Add appropriate icon based on type
    let icon = '';
    switch (type) {
      case 'success':
        icon = '✓';
        break;
      case 'error':
        icon = '✕';
        break;
      case 'info':
        icon = 'ℹ';
        break;
      default:
        icon = 'ℹ';
    }

    toast.innerHTML = `
      <span>${icon}</span>
      <span>${message}</span>
    `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);

    // Add fade-out animation after 2.5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease-out';
    }, 2500);
  }
}