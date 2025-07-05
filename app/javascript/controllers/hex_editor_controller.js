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
    offsetY: Number,
    hexRadius: Number
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
    if(!this.hexRadiusValue) this.hexRadiusValue = 20;
    this.currentMapTranslateX = 0;
    this.currentMapTranslateY = 0;
    this.svgScaleX = 1;
    this.svgScaleY = 1;

    // setup event listeners
    this.element.addEventListener('map-play:transformed', this.updateHexTransform.bind(this));
    document.addEventListener('hexes:hexStyleChange', (event) => this.drawHexes(event.detail.hexStyle));
    document.addEventListener('maps:hexTransform', (event) => this.updateHexesByControls(event.detail));
    document.addEventListener('hexes:regenerateHexes', (event) => this.redrawHexes(event.detail));

    // draw the initial hexes, generating the SVG
    this.drawHexes(document.getElementById("hex-style-switch").textContent.charAt(0));
  }

  redrawHexes(hexes){
    this.hexesValue = hexes.hexes;
    this.hexRadiusValue = hexes.radius;
    this.drawHexes();
  }

  // Draw all hexes on the SVG overlay
  drawHexes(style = this.hexStyle) {
    const svg = document.querySelector('[data-hex-editor-target="hexOverlay"]');
    if (!svg) return;

    this.hexStyle = style;

    svg.innerHTML = '';
    this.hexesValue.forEach(hex => {
      this.drawHex(svg, hex, style)
    });
  }

  drawHex(svg, hex, currentHexStyle) {

    let hexWidth, hexHeight, horizontalSpacing, verticalSpacing;

    if (currentHexStyle === "⬣") { // Flat-top hexagon
      // For flat-top: width = 2 * radius, height = √3 * radius
      hexHeight = Math.sqrt(3) * this.hexRadiusValue;
      hexWidth = 2 * this.hexRadiusValue;

      // Calculate spacing needed
      horizontalSpacing = hexWidth * 0.75; // 75% overlap horizontally
      verticalSpacing = hexHeight; // Full height vertically

    } else { // Pointy-top hexagon
      // For pointy-top: width = √3 * radius, height = 2 * radius
      hexWidth = Math.sqrt(3) * this.hexRadiusValue;
      hexHeight = 2 * this.hexRadiusValue;

      // Calculate spacing needed
      horizontalSpacing = hexWidth; // Full width horizontally
      verticalSpacing = hexHeight * 0.75; // 75% overlap vertically
    }

    // Calculate center position with proper offset for tessellation
    let centerX, centerY;

    if (currentHexStyle === "⬣") { // Flat-top hexagon
      // Every other column is offset horizontally by half the horizontal spacing
      const colOffset = (hex.x_coordinate % 2) * (verticalSpacing / 2);
      centerX = this.hexRadiusValue + (hex.x_coordinate * horizontalSpacing);
      centerY = (hexHeight / 2) + (hex.y_coordinate * verticalSpacing) + colOffset;

    } else { // Pointy-top hexagon
      // Every other row is offset vertically by half the vertical spacing
      const rowOffset = (hex.y_coordinate % 2) * (horizontalSpacing / 2);
      centerX = (hexWidth / 2) + (hex.x_coordinate * horizontalSpacing) + rowOffset;
      centerY = this.hexRadiusValue + (hex.y_coordinate * verticalSpacing);
    }

    // Generate hexagon points
    const points = [];

    if (currentHexStyle === "⬣") { // Flat-top hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerX + this.hexRadiusValue * Math.cos(angle);
        const y = centerY + this.hexRadiusValue * Math.sin(angle);
        points.push(`${x},${y}`);
      }
    } else { // Pointy-top hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - (Math.PI / 2);
        const x = centerX + this.hexRadiusValue * Math.cos(angle);
        const y = centerY + this.hexRadiusValue * Math.sin(angle);
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
      this.currentMapTranslateX = event.detail.translateX;
      this.currentMapTranslateY = event.detail.translateY;
      this.svgScaleX = event.detail.scale;
      this.svgScaleY = event.detail.scale;

      this.applyHexTransform();
    }
  }

  updateHexesByControls(detail){

    this.offsetXValue = parseFloat(detail.offsetX || 0);
    this.offsetYValue = parseFloat(detail.offsetY || 0);
    this.hexScaleXValue = parseFloat(detail.scaleX || 1);
    this.hexScaleYValue = parseFloat(detail.scaleY || 1);

    this.applyHexTransform();
  }

  applyHexTransform() {
    if (this.hasHexOverlayTarget) {
      const finalHexScaleX = this.hexScaleXValue * this.svgScaleX;
      const finalHexScaleY = this.hexScaleYValue * this.svgScaleY;
      const finalTranslateX = this.currentMapTranslateX + this.offsetXValue;
      const finalTranslateY = this.currentMapTranslateY + this.offsetYValue;

      const localTransform = `translate(${finalTranslateX}px, ${finalTranslateY}px) scale(${finalHexScaleX}, ${finalHexScaleY})`;
      this.hexOverlayTarget.style.transform = localTransform;
    }
  }

}