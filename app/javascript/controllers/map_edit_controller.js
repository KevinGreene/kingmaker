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
        hexPointyTop: Boolean,
    }

    connect() {

        /**
         * Mouse Leniency Variable - increase to allow more movement during clicks to still "count" as a click instead of a drag
         */
        this.mouseMoveLeniency = 15;

        // Map Variables
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

        // Hex selection functionality
        this.isDragging = false;
        this.targetedHex = null; // hex that is potentially selected - identified at mouseDown event
        this.selectedHexArray = []; // selected hex or hexes
        this.mouseDownLocationX = 0; // initial X position of the mouse when mouseDown event occurs
        this.mouseDownLocationY = 0; // initial Y position of the mouse when mouseDown event occurs
        this.mouseDownDelta = 0; // total distance the mouse has moved since mouseDown event began.  Resets to 0 on handleMouseUp.
        this.mouseButtonDown = false; // local variable to track if the mouse button is down or up

        // Bind mouse listeners
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);

        // Region Assignment Functionality
        this.regionManager = document.getElementById("hex-region-manage");
        this.regionManagerButton = document.getElementById("hex-region-manage-button");
        this.regionUnassignmentButton = document.getElementById("hex-region-unassign");
        if(this.regionUnassignmentButton){
            this.regionUnassignmentButton.addEventListener('click', () => this.unassignRegions());
        }
        document.querySelectorAll('[id^="hex-region-assign-"]').forEach(button => {
            button.addEventListener('click', (event) => this.assignRegions(event.target.dataset));
        });

        // additional variables
        this.currentMapTranslateX = 0;
        this.currentMapTranslateY = 0;
        this.svgScaleX = 1;
        this.svgScaleY = 1;

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

        // event listeners from 'hex-details'
        document.addEventListener("hex-details:deselectAllHexes", () => this.deselectAllHexes());
        document.addEventListener("hex-details:hexNameChange", (event) => this.hexNameChange(event.detail));

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

    mouseDown(event){
        this.targetedHex = event.target;
        this.mouseButtonDown = event.button === 0;
        this.mouseDownLocationX = event.clientX;
        this.mouseDownLocationY = event.clientY;

        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
    }

    handleMouseMove(event) {
        event.preventDefault();

        if (this.mouseButtonDown && !this.isDragging) {
            // not (yet) dragging - check if drag should be initiated
            if (this.calcShouldInitiateDrag(event)) this.startDrag(event);
        } else {
            // dragging logic
            this.currentX = event.clientX - this.startX;
            this.currentY = event.clientY - this.startY;

            this.updateTransform();
        }

    }

    calcShouldInitiateDrag(event){
        // calculate difference in X and Y direction
        let distX = this.mouseDownLocationX - event.clientX;
        let distY = this.mouseDownLocationY - event.clientY;

        // normalize distance to postive vector
        distX = Math.abs(distX);
        distY = Math.abs(distY);

        // calculate total distance moved
        this.mouseDownDelta += distX + distY;
        return this.mouseDownDelta >= this.mouseMoveLeniency;
    }

    startDrag(event) {
        this.isDragging = true;
        this.mouseDownDelta = 0;
        this.containerTarget.style.cursor = 'grabbing';
        this.startX = event.clientX - this.currentX;
        this.startY = event.clientY - this.currentY;
    }

    handleMouseUp(event) {
        // if not dragging, mouse has clicked - check for hex selection
        if (!this.isDragging) {
            let hexSelectionChanged = false;

            // CTRL key is not held, so reset all hex selection
            if (!event.ctrlKey) {
                const hadSelection = this.selectedHexArray.length > 0;
                this.deselectAllHexes();
                if (hadSelection) {
                    hexSelectionChanged = true;
                }
            }

            // not dragging - select the hex
            if (this.targetedHex.tagName === 'polygon') {
                // enable the Region Assignment functionality
                this.regionManager.classList.add("dropdown-hover");
                this.regionManagerButton.classList.remove("btn-disabled");

                // update the polygon outline to a different color, to indicate it's selected
                this.targetedHex.setAttribute('stroke', '#FF00FF');
                this.targetedHex.setAttribute('stroke-width', '4');
                this.targetedHex.parentNode.appendChild(this.targetedHex);

                // insert this hex into selected hex array if not already there
                const hex = this.hexOverlayArray.find(h => h.id == this.targetedHex.getAttribute('data-hex-id'));
                if (hex && !this.selectedHexArray.find(h => h.id == hex.id)) {
                    this.selectedHexArray.push(hex);
                    hexSelectionChanged = true;
                }

                // Prevent the event from bubbling to the map image
                event.stopPropagation();
            }

            // Only broadcast if there was actually a change in hex selection
            if (hexSelectionChanged) {
                this.broadcastHexData();
            }
        }

        this.isDragging = false;
        this.containerTarget.style.cursor = 'grab';
        this.mouseButtonDown = false;

        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
    }

    deselectAllHexes() {
        // Disable Region assignment functionality
        this.regionManager.classList.remove("dropdown-hover");
        this.regionManagerButton.classList.add("btn-disabled");

        // Deselect all hexes
        this.selectedHexArray = [];
        const polygons = this.hexImageTarget.querySelectorAll('polygon');
        polygons.forEach(polygon => {
            const hexId = polygon.getAttribute('data-hex-id');

            // Find the corresponding hex data
            const hex = this.hexOverlayArray.find(h => h.id == hexId);

            if (hex) {
                // Reset to original color using your existing getHexColor method
                polygon.setAttribute('stroke', 'rgba(0, 0, 0, 0.01)');
                polygon.setAttribute('stroke-width', '2');
            }
        });
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
        polygon.setAttribute('fill', this.getHexColor(hex));
        polygon.setAttribute('stroke', 'rgba(0,0,0, 0.01)');
        polygon.setAttribute('stroke-width', '2');
        polygon.setAttribute('data-hex-id', hex.id);

        svg.appendChild(polygon);
        this.applyHexTransform();
    }

    getHexColor(hex) {
        const transparency = 0.1;
        if (!hex.region_id) {
            return `rgba(255,255,255,${transparency})`
        } else {
            const colors = [
                `rgba(255, 0, 0, ${transparency})`,     // Red
                `rgba(0, 128, 255, ${transparency})`,   // Blue
                `rgba(0, 200, 0, ${transparency})`,     // Green
                `rgba(255, 165, 0, ${transparency})`,   // Orange
                `rgba(128, 0, 128, ${transparency})`,   // Purple
                `rgba(255, 255, 0, ${transparency})`,   // Yellow
                `rgba(255, 20, 147, ${transparency})`,  // Deep Pink
                `rgba(0, 255, 255, ${transparency})`,   // Cyan
                `rgba(139, 69, 19, ${transparency})`,   // Brown
                `rgba(128, 128, 128, ${transparency})`, // Gray
                `rgba(50, 205, 50, ${transparency})`,   // Lime Green
                `rgba(255, 105, 180, ${transparency})`  // Hot Pink
            ];
            return colors[hex.region_id % colors.length];
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

    broadcastHexData() {
        if(this.selectedHexArray.length === 1) {
            this.dispatch("hexSelectionUpdate", {
                detail: {
                    hex: this.selectedHexArray[0]
                },
                bubbles: true
            });
        } else {
            this.dispatch("hexDeselected", {
                bubbles: true
            })
        }
    }

    hexNameChange(detail) {
        this.hexOverlayArray.find(h => h.id == detail.hex.id).label = detail.newName;
        this.saveHex(this.hexOverlayArray.find(h => h.id == detail.hex.id));
    }

    /**
     * Region Section
     */
    async assignRegions(detail) {
        if (!this.selectedHexArray || this.selectedHexArray.length === 0) {
            console.warn('No hexes selected for region assignment');
            return { success: false, error: 'No hexes selected' };
        }

        // Show loading overlay
        this.showSavingOverlay();

        try {
            const hexIds = this.selectedHexArray.map(hex => hex.id);
            const mapId = this.selectedHexArray[0].map_id;

            const response = await fetch(`/maps/${mapId}/hexes/bulk_update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    hex_ids: hexIds,
                    updates: {
                        region_id: detail.regionId
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                this.hideSavingOverlay();
                return {
                    success: false,
                    error: data.errors || data.error
                };
            }

            // Success - refresh the page to show updated hex colors
            window.location.reload();

            return {
                success: true,
                message: `Region assigned to ${hexIds.length} hexes`,
                updatedHexes: data.hexes
            };
        } catch (e) {
            this.hideSavingOverlay();
            console.error('Error assigning regions:', e);
            return { success: false, error: e.message };
        }
    }

    async unassignRegions() {
        if (!this.selectedHexArray || this.selectedHexArray.length === 0) {
            console.warn('No hexes selected for region unassignment');
            return { success: false, error: 'No hexes selected' };
        }

        this.showSavingOverlay();

        try {
            const hexIds = this.selectedHexArray.map(hex => hex.id);
            const mapId = this.selectedHexArray[0].map_id;

            const response = await fetch(`/maps/${mapId}/hexes/bulk_update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    hex_ids: hexIds,
                    updates: {
                        region_id: null
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                this.hideSavingOverlay();
                return {
                    success: false,
                    error: data.errors || data.error
                };
            }

            // Success - refresh the page to show updated hex colors
            window.location.reload();

            return {
                success: true,
                message: `Region unassigned from ${hexIds.length} hexes`,
                updatedHexes: data.hexes
            };
        } catch (e) {
            this.hideSavingOverlay();
            console.error('Error unassigning regions:', e);
            return { success: false, error: e.message };
        }
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

        console.log(mapData);

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

    async saveHex(hex){
        console.log("saving hex", hex);
        try{
            const response = await fetch(`/maps/${hex.map_id}/hexes/${hex.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    hex: hex
                })
            });
            if(!response.ok){
                console.error('failed to save hex', hex);
            }
        } catch (error){
            console.log("error saving hex: ", hex, error);
        }
        console.log(`hex ${hex.id} saved successfully`);
    }

    showSavingOverlay() {
        // Create overlay if it doesn't exist
        if (!document.getElementById('saving-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'saving-overlay';
            overlay.innerHTML = `
                <div class="overlay-background">
                    <div class="overlay-content">
                        <div class="spinner"></div>
                        <p>Saving changes...</p>
                    </div>
                </div>
            `;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                pointer-events: auto;
            `;

            const overlayCSS = `
                .overlay-background {
                    background: rgba(0, 0, 0, 0.7);
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .overlay-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    text-align: center;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;

            const style = document.createElement('style');
            style.textContent = overlayCSS;
            document.head.appendChild(style);

            document.body.appendChild(overlay);
        }

        document.getElementById('saving-overlay').style.display = 'block';
    }

    hideSavingOverlay() {
        const overlay = document.getElementById('saving-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}