import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "normalImage", "editImage"]
  static values = { mapId: Number }

  connect() {
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.scale = 1;
    this.minScale = 0.5;
    this.maxScale = 3;
    this.zoomRate = 0.2;

    // Bind event listeners
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);

    // Prevent context menu on right click
    this.containerTarget.addEventListener('contextmenu', (e) => e.preventDefault());

    // Initialize image position
    this.updateTransform();
  }

  disconnect() {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  startDrag(event) {
    event.preventDefault();

    this.isDragging = true;
    this.startX = event.clientX - this.currentX;
    this.startY = event.clientY - this.currentY;

    this.containerTarget.style.cursor = 'grabbing';

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  handleMouseMove(event) {
    if (!this.isDragging) return;

    event.preventDefault();

    this.currentX = event.clientX - this.startX;
    this.currentY = event.clientY - this.startY;

    this.updateTransform();
  }

  handleMouseUp(event) {
    // debugging
    console.log("handleMouseUp called", this.element, event.target);

    if (!this.isDragging) return;

    this.isDragging = false;
    this.containerTarget.style.cursor = 'grab';

    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  handleZoom(event) {
    event.preventDefault();

    const delta = event.deltaY > 0 ? -this.zoomRate : this.zoomRate;
    const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));

    if (newScale !== this.scale) {
      // Get mouse position relative to container
      const rect = this.containerTarget.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) - (rect.left - window.screenX);
      const mouseY = (event.clientY - rect.top) - (rect.left - window.screenY);

      // Calculate the point on the image that the mouse is currently over
      const imagePointX = (mouseX - this.currentX) / this.scale;
      const imagePointY = (mouseY - this.currentY) / this.scale;

      // Update scale
      this.scale = newScale;

      // Calculate new position so the same image point stays under the mouse
      this.currentX = mouseX - (imagePointX * this.scale);
      this.currentY = mouseY - (imagePointY * this.scale);

      this.updateTransform();
    }
  }

  updateTransform() {
    const transform = `translate(${this.currentX}px, ${this.currentY}px) scale(${this.scale})`;

    if (this.hasNormalImageTarget && !document.getElementById("normal-map-view").classList.contains("hidden")) {
      this.normalImageTarget.style.transform = transform;
    }

    if (this.hasEditImageTarget && !document.getElementById("hex-edit-view").classList.contains("hidden")) {
      this.editImageTarget.style.transform = transform;
    }

    this.dispatch('transformed', {
      detail: {
        transform: transform,
        translateX: this.currentX,
        translateY: this.currentY,
        scale: this.scale
      },
      bubbles: true
    });
  }

  resetView() {
    this.currentX = 0
    this.currentY = 0
    this.scale = 1
    this.updateTransform()
  }
}