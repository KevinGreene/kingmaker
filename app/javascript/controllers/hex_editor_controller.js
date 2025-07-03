import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["hexOverlay"]
  static values = {
    hexes: Array,
    mapWidth: Number,
    mapHeight: Number,
    maxCols: Number,
    maxRows: Number,
    hexScaleX: Number,
    hexScaleY: Number,
    offsetX: Number,
    offsetY: Number
  }

  connect() {
    // setup variables
    this.hexStyle = "⬣";
    this.offsetXValue = document.getElementById("position_x")?.value || 0;
    this.offsetYValue = document.getElementById("position_y")?.value || 0;
    this.hexScaleXValue = document.getElementById("scale_x")?.value || 1;
    this.hexScaleYValue = document.getElementById("scale_y")?.value || 1;
    if(!this.maxColsValue) this.maxColsValue = 10;
    if(!this.maxRowsValue) this.maxRowsValue = 10;
    if(!this.mapWidthValue) this.mapWidthValue = 800;
    if(!this.mapHeightValue) this.mapHeightValue = 600;
    this.currentMapTranslateX = 0;
    this.currentMapTranslateY = 0;
    this.svgScaleX = 1;
    this.svgScaleY = 1;

    // setup event listeners
    this.element.addEventListener('map-play:transformed', this.updateHexTransform.bind(this));
    document.addEventListener('hexes:hexStyleChange', (event) => this.drawHexes(event.detail.hexStyle));
    document.addEventListener('maps:hexTransform', (event) => this.updateHexesByControls(event.detail));

    // draw the initial hexes, generating the SVG
    this.drawHexes(document.getElementById("hex-style-switch").textContent.charAt(0));
  }

  // Draw all hexes on the SVG overlay
  drawHexes(style = this.hexStyle) {
    const svg = document.querySelector('[data-hex-editor-target="hexOverlay"]');
    if (!svg) return;

    this.hexStyle = style;

    svg.innerHTML = '';
    this.hexesValue.forEach(hex => {
      this.drawHex(svg, hex, style, this.mapWidthValue, this.mapHeightValue, this.maxColsValue, this.maxRowsValue)
    });
  }

  drawHex(svg, hex, currentHexStyle, mapWidth, mapHeight, maxCols, maxRows) {

    let hexWidth, hexHeight, horizontalSpacing, verticalSpacing;
    const mapLength = Math.min(mapWidth, mapHeight);
    const mapGrid = Math.min(maxCols, maxRows);
    const radius = (mapLength / mapGrid) / 2;

    if (currentHexStyle === "⬣") { // Flat-top hexagon
      // For flat-top: width = 2 * radius, height = √3 * radius
      hexHeight = Math.sqrt(3) * radius; // temp radius for calculation
      hexWidth = 2 * radius;

      // Calculate spacing needed
      horizontalSpacing = hexWidth * 0.75; // 75% overlap horizontally
      verticalSpacing = hexHeight; // Full height vertically

    } else { // Pointy-top hexagon
      // For pointy-top: width = √3 * radius, height = 2 * radius
      hexWidth = Math.sqrt(3) * radius; // temp radius for calculation
      hexHeight = 2 * radius;

      // Calculate spacing needed
      horizontalSpacing = hexWidth; // Full width horizontally
      verticalSpacing = hexHeight * 0.75; // 75% overlap vertically
    }

    // Calculate center position with proper offset for tessellation
    let centerX, centerY;

    if (currentHexStyle === "⬣") { // Flat-top hexagon
      // Every other column is offset horizontally by half the horizontal spacing
      const colOffset = (hex.x_coordinate % 2) * (verticalSpacing / 2);
      centerX = radius + (hex.x_coordinate * horizontalSpacing);
      centerY = (hexHeight / 2) + (hex.y_coordinate * verticalSpacing) + colOffset;

    } else { // Pointy-top hexagon
      // Every other row is offset vertically by half the vertical spacing
      const rowOffset = (hex.y_coordinate % 2) * (horizontalSpacing / 2);
      centerX = (hexWidth / 2) + (hex.x_coordinate * horizontalSpacing) + rowOffset;
      centerY = radius + (hex.y_coordinate * verticalSpacing);
    }

    // Generate hexagon points
    const points = [];

    if (currentHexStyle === "⬣") { // Flat-top hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push(`${x},${y}`);
      }
    } else { // Pointy-top hexagon
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
    this.applyHexTransform();
  }

  getHexColor(hex) {
    if (!hex.region_id) {
      return '#808080'
    } else {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
      return colors[hex.region_id % 6]
    }
  }

  updateHexTransform(event) {
    if (this.hasHexOverlayTarget) {
      this.currentMapTranslateX = event.detail.translateX + this.offsetXValue;
      this.currentMapTranslateY = event.detail.translateY + this.offsetYValue;
      this.svgScaleX = event.detail.scale * this.hexScaleXValue;
      this.svgScaleY = event.detail.scale * this.hexScaleYValue;

      console.log("map moved. scale:", this.svgScaleX, this.svgScaleY, "translation:", this.currentMapTranslateX, this.currentMapTranslateY)

      this.applyHexTransform();
    }
  }

  updateHexesByControls(detail){

    this.currentMapTranslateX -= this.offsetXValue;
    this.offsetXValue = parseFloat(detail.offsetX || 0);
    this.currentMapTranslateX += this.offsetXValue;

    this.currentMapTranslateY -= this.offsetYValue;
    this.offsetYValue = parseFloat(detail.offsetY || 0);
    this.currentMapTranslateY += this.offsetYValue;

    this.svgScaleX *= parseFloat(detail.scaleX || 1);
    this.hexScaleXValue = parseFloat(detail.scaleX || 1);

    this.svgScaleY = parseFloat(detail.scaleY || 1);
    this.hexScaleYValue = parseFloat(detail.scaleY || 1);

    console.log("controls updated. scale:", this.svgScaleX, this.svgScaleY, "translation:", this.currentMapTranslateX, this.currentMapTranslateY)

    this.applyHexTransform();
  }

  applyHexTransform() {
    if (this.hasHexOverlayTarget) {
/*
      const finalHexScaleX = this.hexScaleXValue * this.svgScaleX;
      const finalHexScaleY = this.hexScaleYValue * this.svgScaleY;
*/

      const localTransform = `translate(${this.currentMapTranslateX}px, ${this.currentMapTranslateY}px) scale(${this.svgScaleX}, ${this.svgScaleY})`;
      this.hexOverlayTarget.style.transform = localTransform;
    }
  }

}