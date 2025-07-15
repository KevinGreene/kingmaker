// app/javascript/controllers/simple_cropper_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["fileInput", "cropModal", "cropModalLabel", "dragImage", "croppedData", "currentAvatar", "urlModal", "urlModalLabel", "urlInput"]

  connect() {
    this.isDragging = false
    this.startX = 0
    this.startY = 0
    this.imageX = 0
    this.imageY = 0
  }

  selectFile() {
    this.fileInputTarget.click()
  }

  handleFileUpload(event) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.showCropModal(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  showUrlModal() {
    this.urlModalTarget.checked = true
    this.urlInputTarget.value = ''
  }

  loadImageFromUrl() {
    const url = this.urlInputTarget.value
    if (url) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        this.urlModalTarget.checked = false
        this.showCropModal(url)
      }
      img.onerror = () => {
        alert('Could not load image from URL. Please check the URL and try again.')
      }
      img.src = url
    }
  }

  showCropModal(imageSrc) {
    this.dragImageTarget.src = imageSrc
    this.cropModalTarget.checked = true

    // Reset position
    this.imageX = 0
    this.imageY = 0

    // Wait for image to load and then center it
    this.dragImageTarget.onload = () => {
      this.centerImage()
    }
  }

  centerImage() {
    const img = this.dragImageTarget
    const container = img.parentElement

    // Calculate scale to fit image nicely in circle
    const containerSize = 200
    const scale = Math.max(containerSize / img.naturalWidth, containerSize / img.naturalHeight) * 1.2

    img.style.width = `${img.naturalWidth * scale}px`
    img.style.height = `${img.naturalHeight * scale}px`

    // Center the image
    this.imageX = (containerSize - img.offsetWidth) / 2
    this.imageY = (containerSize - img.offsetHeight) / 2
    this.updateImagePosition()
  }

  startDrag(event) {
    event.preventDefault()
    this.isDragging = true

    const clientX = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX
    const clientY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY

    this.startX = clientX - this.imageX
    this.startY = clientY - this.imageY

    // Add event listeners
    document.addEventListener('mousemove', this.drag.bind(this))
    document.addEventListener('mouseup', this.stopDrag.bind(this))
    document.addEventListener('touchmove', this.drag.bind(this))
    document.addEventListener('touchend', this.stopDrag.bind(this))
  }

  drag(event) {
    if (!this.isDragging) return

    event.preventDefault()
    const clientX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX
    const clientY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY

    this.imageX = clientX - this.startX
    this.imageY = clientY - this.startY

    // Constrain to container bounds
    const img = this.dragImageTarget
    const containerSize = 200

    this.imageX = Math.min(0, Math.max(containerSize - img.offsetWidth, this.imageX))
    this.imageY = Math.min(0, Math.max(containerSize - img.offsetHeight, this.imageY))

    this.updateImagePosition()
  }

  stopDrag() {
    this.isDragging = false
    document.removeEventListener('mousemove', this.drag.bind(this))
    document.removeEventListener('mouseup', this.stopDrag.bind(this))
    document.removeEventListener('touchmove', this.drag.bind(this))
    document.removeEventListener('touchend', this.stopDrag.bind(this))
  }

  updateImagePosition() {
    this.dragImageTarget.style.transform = `translate(${this.imageX}px, ${this.imageY}px)`
  }

  applyCrop() {
    const img = this.dragImageTarget
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Set canvas size to desired output (200x200)
    canvas.width = 200
    canvas.height = 200

    // Calculate the crop area (center 200x200 of the positioned image)
    const cropX = -this.imageX
    const cropY = -this.imageY
    const cropSize = 200

    // Create a new image object to get natural dimensions
    const sourceImg = new Image()
    sourceImg.onload = () => {
      // Calculate scale factor
      const displayWidth = img.offsetWidth
      const scale = sourceImg.naturalWidth / displayWidth

      // Draw the cropped portion
      ctx.drawImage(
        sourceImg,
        cropX * scale, cropY * scale, cropSize * scale, cropSize * scale, // source
        0, 0, 200, 200 // destination
      )

      // Convert to base64
      const croppedImageData = canvas.toDataURL('image/jpeg', 0.8)
      this.croppedDataTarget.value = croppedImageData

      // Update preview
      if (this.hasCurrentAvatarTarget) {
        this.currentAvatarTarget.src = croppedImageData
      } else {
        const avatarContainer = document.querySelector('.avatar .w-16')
        avatarContainer.innerHTML = `<img data-simple-cropper-target="currentAvatar" src="${croppedImageData}" alt="Profile picture" class="rounded-full" />`
      }

      this.cropModalTarget.checked = false
    }

    sourceImg.crossOrigin = 'anonymous'
    sourceImg.src = img.src
  }

  removeAvatar() {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      this.croppedDataTarget.value = 'REMOVE'
      const avatarContainer = document.querySelector('.avatar .w-16')
      avatarContainer.innerHTML = `
        <div class="flex items-center justify-center w-full h-full text-base-content/50">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 717.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      `
    }
  }
}