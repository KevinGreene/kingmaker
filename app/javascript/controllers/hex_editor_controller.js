import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["hexOverlay"]
  static values = {
    hexes: Array,
    hexScaleX: Number,
    hexScaleY: Number,
    offsetX: Number,
    offsetY: Number
  }


  connect() {
    this.element.addEventListener('map-play:transformed', this.updateHexTransform.bind(this));
    document.addEventListener('hexes:hexStyleChange', (event) => this.drawHexes(event.detail.hexStyle));
    this.drawHexes(document.getElementById("hex-style-switch").textContent.charAt(0));
  }

  // Draw all hexes on the SVG overlay
  drawHexes(hexStyle) {
    if (!this.hasHexOverlayTarget) return;

    const svg = this.hexOverlayTarget;
    svg.innerHTML = '';

    this.hexesValue.forEach(hex => {
      this.drawHex(svg, hex, hexStyle);
    });
  }

  drawHex(svg, hex, currentHexStyle) {
    // Use the Value accessors correctly
    const centerX = (this.hexScaleXValue * 40 * hex.x_coordinate) + this.offsetXValue + (20 * this.hexScaleXValue);
    const centerY = (this.hexScaleYValue * 40 * hex.y_coordinate) + this.offsetYValue + (20 * this.hexScaleYValue);
    const radius = 18;

    const points = [];

    // Use the currentHexStyle passed from the event
    if (currentHexStyle === "⬣") { // Flat-top hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push(`${x},${y}`);
      }
    } else { // Pointy-top hexagon (⬢)
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - (Math.PI / 2);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push(`${x},${y}`);
      }
    }

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points.join(' '));
    polygon.setAttribute('fill', 'transparent');
    polygon.setAttribute('stroke', this.getHexColor(hex));
    polygon.setAttribute('stroke-width', '2');
    polygon.setAttribute('data-hex-id', hex.id);

    svg.appendChild(polygon);
  }

  getHexColor(hex) {
    if (!hex.region_id) {
      return '#808080'
    } else {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
      return colors[hex.region_id % 6]
    }
  }

  // Apply the same transform to the hex overlay that's applied to the map image
  updateHexTransform(event) {
    if (this.hasHexOverlayTarget) {
      // Apply the exact same transform string that's applied to the map image
      this.hexOverlayTarget.style.transform = event.detail.transform
    }
  }


}