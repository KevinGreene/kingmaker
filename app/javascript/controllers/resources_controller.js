import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "newResourceInput",
    "newResourceDescriptionInput",
    "createForm",
    "editForm",
    "editResourceInput",
    "editResourceDescriptionInput",
    "deleteButton",
    "deleteModal",
    "deleteResourceName",
    "unsavedModal"
  ]

  static values = {
    mapId: Number
  }

  connect() {
    this.currentResourceId = null
    this.originalValues = {}
    this.hasUnsavedChanges = false
    this.pendingAction = null
    this.selectedRadio = null
  }

  // Create new resource
  async createResource() {
    const name = this.newResourceInputTarget.value.trim()
    const description = this.newResourceDescriptionInputTarget.value.trim()

    if (!name) {
      this.showInputError(this.newResourceInputTarget, "Name is required")
      return
    }

    try {
      const response = await fetch(`/maps/${this.mapIdValue}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken()
        },
        body: JSON.stringify({
          resource: {
            name: name,
            description: description
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        this.showToast('Resource created successfully!', 'success')
        this.clearCreateForm()
        // Reload just the modal content
        await this.reloadModalContent()
      } else {
        this.showToast('Failed to create resource: ' + data.errors.join(', '), 'error')
      }
    } catch (error) {
      console.error('Error creating resource:', error)
      this.showToast('An error occurred while creating the resource', 'error')
    }
  }

  // Handle radio button selection
  selectResource(event) {
    const radio = event.currentTarget
    const resourceId = radio.value

    // If clicking the same radio button, deselect it
    if (this.selectedRadio === radio && radio.checked) {
      radio.checked = false
      this.clearSelection()
      return
    }

    // If there are unsaved changes, handle them first
    if (this.hasUnsavedChanges) {
      this.pendingAction = () => this.performSelection(radio)
      this.unsavedModalTarget.showModal()
      return
    }

    this.performSelection(radio)
  }

  performSelection(radio) {
    this.selectedRadio = radio
    const resourceId = radio.value
    const resourceName = radio.dataset.resourceName
    const resourceDescription = radio.dataset.resourceDescription || ''

    this.currentResourceId = resourceId
    this.originalValues = {
      name: resourceName,
      description: resourceDescription
    }

    // Hide all delete buttons first
    this.deleteButtonTargets.forEach(btn => btn.classList.add('hidden'))

    // Show delete button for selected resource
    const deleteButton = this.deleteButtonTargets.find(btn =>
      btn.dataset.resourceId === resourceId
    )
    if (deleteButton) {
      deleteButton.classList.remove('hidden')
    }

    // Switch to edit form
    this.createFormTarget.classList.add('hidden')
    this.editFormTarget.classList.remove('hidden')

    // Populate edit form
    this.editResourceInputTarget.value = resourceName
    this.editResourceDescriptionInputTarget.value = resourceDescription

    this.hasUnsavedChanges = false
  }

  // Clear selection
  clearSelection() {
    // Deselect radio button
    if (this.selectedRadio) {
      this.selectedRadio.checked = false
      this.selectedRadio = null
    }

    // Hide all delete buttons
    this.deleteButtonTargets.forEach(btn => btn.classList.add('hidden'))

    // Switch back to create form
    this.editFormTarget.classList.add('hidden')
    this.createFormTarget.classList.remove('hidden')

    this.currentResourceId = null
    this.originalValues = {}
    this.hasUnsavedChanges = false
    this.clearInputErrors()
  }

  // Save resource changes
  async saveResource() {
    const name = this.editResourceInputTarget.value.trim()
    const description = this.editResourceDescriptionInputTarget.value.trim()

    if (!name) {
      this.showInputError(this.editResourceInputTarget, "Name is required")
      return
    }

    try {
      const response = await fetch(`/maps/${this.mapIdValue}/resources/${this.currentResourceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken()
        },
        body: JSON.stringify({
          resource: {
            name: name,
            description: description
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        this.showToast('Resource updated successfully!', 'success')
        this.clearSelection()
        // Reload just the modal content
        await this.reloadModalContent()
      } else {
        this.showToast('Failed to update resource: ' + data.errors.join(', '), 'error')
      }
    } catch (error) {
      console.error('Error updating resource:', error)
      this.showToast('An error occurred while updating the resource', 'error')
    }
  }

  // Cancel edit
  cancelEdit() {
    if (this.hasUnsavedChanges) {
      this.pendingAction = () => this.clearSelection()
      this.unsavedModalTarget.showModal()
      return
    }

    this.clearSelection()
  }

  // Delete resource
  deleteResource(event) {
    const button = event.currentTarget
    const resourceId = button.dataset.resourceId
    const resourceName = button.dataset.resourceName

    this.currentResourceId = resourceId
    this.deleteResourceNameTarget.textContent = resourceName
    this.deleteModalTarget.showModal()
  }

  async confirmDelete() {
    try {
      const response = await fetch(`/maps/${this.mapIdValue}/resources/${this.currentResourceId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': this.getCSRFToken()
        }
      })

      const data = await response.json()

      if (data.success) {
        this.showToast('Resource deleted successfully!', 'success')
        this.deleteModalTarget.close()
        // Reload just the modal content
        await this.reloadModalContent()
      } else {
        this.showToast('Failed to delete resource', 'error')
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      this.showToast('An error occurred while deleting the resource', 'error')
    }
  }

  cancelDelete() {
    this.deleteModalTarget.close()
    this.currentResourceId = null
  }

  // Input validation and error handling
  clearInputError(event) {
    const input = event.currentTarget
    input.classList.remove('input-error')

    // Track changes for unsaved changes detection
    if (this.editFormTarget && !this.editFormTarget.classList.contains('hidden')) {
      this.checkForUnsavedChanges()
    }
  }

  checkForUnsavedChanges() {
    const currentName = this.editResourceInputTarget.value.trim()
    const currentDescription = this.editResourceDescriptionInputTarget.value.trim()

    this.hasUnsavedChanges = (
      currentName !== this.originalValues.name ||
      currentDescription !== this.originalValues.description
    )
  }

  showInputError(input, message) {
    input.classList.add('input-error')
    this.showToast(message, 'error')
  }

  clearInputErrors() {
    const inputs = this.element.querySelectorAll('.input-error')
    inputs.forEach(input => input.classList.remove('input-error'))
  }

  clearCreateForm() {
    this.newResourceInputTarget.value = ''
    this.newResourceDescriptionInputTarget.value = ''
    this.clearInputErrors()
  }

  // Unsaved changes modal handlers
  discardChanges() {
    this.unsavedModalTarget.close()
    this.hasUnsavedChanges = false

    if (this.pendingAction) {
      this.pendingAction()
      this.pendingAction = null
    }
  }

  async saveAndContinue() {
    await this.saveResource()
    this.unsavedModalTarget.close()

    if (this.pendingAction) {
      this.pendingAction()
      this.pendingAction = null
    }
  }

  // Modal management
  closeModal() {
    if (this.hasUnsavedChanges) {
      this.pendingAction = () => this.performCloseModal()
      this.unsavedModalTarget.showModal()
      return
    }

    this.performCloseModal()
  }

  performCloseModal() {
    const modal = document.getElementById('resources_modal')
    if (modal) {
      modal.close()
    }
  }

  // Utility methods
  async reloadModalContent() {
    try {
      // Create a temporary container to fetch fresh content
      const tempContainer = document.createElement('div')

      // Fetch the map edit page again
      const response = await fetch(window.location.href, {
        headers: {
          'Accept': 'text/html',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (response.ok) {
        const html = await response.text()
        tempContainer.innerHTML = html

        // Find the new resource management form
        const newResourceForm = tempContainer.querySelector('[data-controller="resources"]')

        if (newResourceForm) {
          // Store current state
          const wasEditFormVisible = !this.editFormTarget.classList.contains('hidden')

          // Replace the current content
          const parent = this.element.parentNode
          parent.innerHTML = newResourceForm.outerHTML

          // If we were in edit mode, clear the selection to return to create mode
          // (since the resource list has been refreshed)
          if (wasEditFormVisible) {
            // The new controller instance will handle this automatically
          }
        }
      }
    } catch (error) {
      console.error('Error reloading modal content:', error)
      // Show error message but don't reload page
      this.showToast('Error refreshing content. Please close and reopen the modal.', 'error')
    }
  }

  getCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]')
    return token ? token.getAttribute('content') : ''
  }

  showToast(message, type) {
    // Find or create toast container at the body level (outside modal)
    let toastContainer = document.querySelector('.global-toast-container')
    if (!toastContainer) {
      toastContainer = document.createElement('div')
      toastContainer.className = 'global-toast-container'
      toastContainer.style.cssText = `
        position: fixed;
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        pointer-events: none;
        max-width: 90vw;
      `
      document.body.appendChild(toastContainer)
    }

    // Create toast element
    const toast = document.createElement('div')
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error'
    toast.className = `alert ${alertClass} shadow-lg mb-2`
    toast.style.cssText = `
      pointer-events: auto;
      max-width: 500px;
      margin: 0 auto 0.5rem auto;
    `
    toast.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button class="btn btn-sm btn-ghost ml-2" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `

    toastContainer.appendChild(toast)

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove()
        // Clean up container if no more toasts
        if (toastContainer.children.length === 0) {
          toastContainer.remove()
        }
      }
    }, 3000)
  }
}