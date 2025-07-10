import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["container", "mapImage", "hexImage"]
    static values = {
        mapName: String,
        mapDescription: String,
        hexes: Array,
        mapWidth: Number,
        mapHeight: Number,
        cols: Number,
        rows: Number,
        hexScaleX: Number,
        hexScaleY: Number,
        offsetX: Number,
        offsetY: Number,
        hexRadius: Number,
        playerId: Number,
        hexPointyTop: Boolean
    }

    connect() {
        // Map Variables
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.scale = 1;
        this.minScale = 0.4;
        this.maxScale = 3.5;
        this.zoomRate = 0.2;

        // Hex variables
        this.hexStyle = this.hexPointyTopValue ? "⬢" : "⬣";
        this.offsetXValue = document.getElementById("position_x")?.value || 0;
        this.offsetYValue = document.getElementById("position_y")?.value || 0;
        this.hexScaleXValue = document.getElementById("scale_x")?.value || 1;
        this.hexScaleYValue = document.getElementById("scale_y")?.value || 1;
        this.hexOverlayArray = this.hexesValue;
        if(!this.mapWidthValue) this.mapWidthValue = 800;
        if(!this.mapHeightValue) this.mapHeightValue = 600;

        // additional variables
        this.currentMapTranslateX = 0;
        this.currentMapTranslateY = 0;
        this.svgScaleX = 1;
        this.svgScaleY = 1;


        // Bind mouse listeners
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);

        // Prevent context menu on right click
        if(this.hasContainerTarget){
            this.containerTarget.addEventListener('contextmenu', (e) => e.preventDefault());
        }

        // event listeners for dispatches from 'map-control'
        document.addEventListener("map-control:hexStyleChange", (event) => this.updateHexStyle(event.detail.isPointyTop));
        document.addEventListener("map-control:svgTransformChange", (event) => this.updateSVGTransform(event.detail));
        document.addEventListener("map-control:radiusChange", (event) => this.updateRadius(event.detail.radius));
        document.addEventListener("map-control:colChange", (event) => this.updateDimensions(event.detail));
        document.addEventListener("map-control:rowChange", (event) => this.updateDimensions(event.detail));
        document.addEventListener("radiusChange", (event) => this.updateRadius(event.detail.radius));
        document.addEventListener("dimensionChange", (event) => this.updateDimensions(event.detail));
        document.addEventListener("map-control:saveAll", (event) => this.saveAll(event.detail));

        // Initialize image position
        this.updateTransform();

        // Draw hexes on the map
        this.drawHexes();
    }

    disconnect() {
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
    }

    /**
     * Map Movement Controls
     */

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
        const imageTransform = `translate(${this.currentX}px, ${this.currentY}px) scale(${this.scale})`;
        const hexTransform = `translate(${this.currentX}px, ${this.currentY}px) scale(${this.scale}) translate(${this.offsetXValue}px, ${this.offsetYValue}px) scale(${this.hexScaleXValue}, ${this.hexScaleYValue})`;

        if (this.hasMapImageTarget) {
            this.mapImageTarget.style.transform = imageTransform;
        }
        if (this.hasHexImageTarget) {
            this.hexImageTarget.style.transform = hexTransform;
        }
    }

    resetView() {
        this.currentX = 0
        this.currentY = 0
        this.scale = 1
        this.updateTransform()
    }

    /**
     * HEX SECTION
     */

    drawHexes() {
        if (!this.hasHexImageTarget) {
            return;
        }

        this.updateHexOverlay();

        const svg = this.hexImageTarget;
        svg.innerHTML = '';
        this.hexOverlayArray.forEach(hex => {
            this.drawHex(svg, hex, this.hexStyle)
        });
    }

    drawHex(svg, hex, currentHexStyle) {

        const radius = this.hexRadiusValue / 100;

        let hexWidth, hexHeight, horizontalSpacing, verticalSpacing;
        if (currentHexStyle === "⬣") { // Flat-top hexagon
            // For flat-top: width = 2 * radius, height = √3 * radius
            hexHeight = Math.sqrt(3) * radius;
            hexWidth = 2 * radius;

            // Calculate spacing needed
            horizontalSpacing = hexWidth * 0.75; // 75% overlap horizontally
            verticalSpacing = hexHeight; // Full height vertically

        } else { // Pointy-top hexagon
            // For pointy-top: width = √3 * radius, height = 2 * radius
            hexWidth = Math.sqrt(3) * radius;
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

    applyHexTransform() {
        if (this.hasHexImageTarget) {
            // Use the same transformation pattern as updateTransform
            const hexTransform = `translate(${this.currentX}px, ${this.currentY}px) scale(${this.scale}) translate(${this.offsetXValue}px, ${this.offsetYValue}px) scale(${this.hexScaleXValue}, ${this.hexScaleYValue})`;
            this.hexImageTarget.style.transform = hexTransform;
        }
    }

    updateHexOverlay() {
        // Create a map of existing hexes by coordinates for quick lookup
        const existingHexMap = new Map();
        this.hexesValue.forEach(hex => {
            const key = `${hex.x_coordinate},${hex.y_coordinate}`;
            existingHexMap.set(key, hex);
        });

        // Generate the complete grid based on current rows and cols
        const newHexOverlay = [];

        for (let y = 0; y < this.rowsValue; y++) {
            for (let x = 0; x < this.colsValue; x++) {
                const key = `${x},${y}`;

                if (existingHexMap.has(key)) {
                    // Use existing hex data if it exists
                    newHexOverlay.push(existingHexMap.get(key));
                } else {
                    // Create new hex with default values
                    const newHex = {
                        id: null, // Will be set when saved to database
                        x_coordinate: x,
                        y_coordinate: y,
                        label: null,
                        reconnoitered: false,
                        claimed: false,
                        visible: true,
                        map_id: this.mapIdValue,
                        created_at: null,
                        updated_at: null,
                        region_id: null
                    };
                    newHexOverlay.push(newHex);
                }
            }
        }

        // Sort the array properly: first by y_coordinate (rows), then by x_coordinate (columns)
        newHexOverlay.sort((a, b) => {
            if (a.y_coordinate !== b.y_coordinate) {
                return a.y_coordinate - b.y_coordinate;
            }
            return a.x_coordinate - b.x_coordinate;
        });

        // Update the overlay array
        this.hexOverlayArray = newHexOverlay;
    }

    updateSVGTransform(detail){
        this.offsetXValue = detail.offsetXValue;
        this.offsetYValue = detail.offsetYValue;
        this.hexScaleXValue = detail.scaleXValue;
        this.hexScaleYValue = detail.scaleYValue;
        this.drawHexes();
    }

    updateRadius(radius){
        this.hexRadiusValue = radius;
        this.drawHexes();
    }

    updateDimensions(detail){
        if(detail.rows != null){
            this.rowsValue = detail.rows;
        }
        if(detail.cols != null){
            this.colsValue = detail.cols;
        }
        this.drawHexes();
    }

    updateHexStyle(isPointyTop){
        this.hexStyle = isPointyTop ? "⬢" : "⬣";
        this.drawHexes();
    }

    /**
     * Save Functionality
     */

    async saveAll(detail){
        await this.saveMap(detail.mapId, detail.playerId);
        await this.saveHexes(detail.mapId);
    }

    async saveMap(mapId, playerId) {

        const isPointyTop = this.hexStyle === "⬢";
        const mapData = {
            columns: this.colsValue,
            rows: this.rowsValue,
            hex_radius: this.hexRadiusValue,
            offset_x: this.offsetXValue,
            offset_y: this.offsetYValue,
            hex_scale_x: this.hexScaleXValue,
            hex_scale_y: this.hexScaleYValue,
            is_hex_pointy_top: isPointyTop
        }

        try {
            const response = await fetch(`/maps/${mapId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({map: mapData})
            });

            if (response.ok) {
                await this.savePlayer(mapId, playerId, true);
            } else {
                console.error('Failed to update map');
            }
        } catch (e) {
            console.error('Error updating map:', e);
        }
        console.log("map saved successfully");
    }

    async savePlayer(mapId, playerId, isGM){
        console.log("savePlayer running");
        const playerData = {
            player_id: playerId,
            gm: isGM
        }

        try{
            const response = await fetch(`/maps/${mapId}/player_maps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ player_map: playerData })
            });

            if (response.ok) {
                console.log('User Saved as GM Successfully');
            } else {
                console.error('Failed to update map');
            }
        }catch (e){
            console.error('Error updating map:', e);
        }

        console.log("player saved successfully");
    }

    async saveHexes(mapId) {
        console.log("beginning to save hexes");
        try {
            const response = await fetch(`/maps/${mapId}/hexes/bulk_create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    hexes: this.hexOverlayArray,
                    map_id: mapId
                })
            });
            if (!response.ok) {
                console.error('Failed to create hexes');
            }
        } catch (error) {
            console.error('Error creating hexes:', error);
        }

        console.log("hexes saved successfully");
    }
}