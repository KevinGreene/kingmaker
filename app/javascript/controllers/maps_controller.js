import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static values = {
        mapId: Number,
        playerId: Number,
        isGm: Boolean
    }
    static targets = ["preview"];

    connect(){
        const sliderCols = document.getElementById('map-col-control');
        const valueDisplayCols = document.getElementById('map-col-value');
        const sliderRows = document.getElementById('map-row-control');
        const valueDisplayRows = document.getElementById('map-row-value');
        const radiusSize = document.getElementById("map-hex-radius-control");
        const radiusDisplay = document.getElementById("map-hex-radius-value");

        /**
         * Columns Controls Section
         */
        if(sliderCols) {
            sliderCols.addEventListener('input', function () {
                valueDisplayCols.textContent = this.value;
                const event = new CustomEvent('hexDimensionUpdate', {
                    detail: {
                        cols: sliderCols.value,
                        rows: sliderRows.value
                    },
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            });
        }


        /**
         * Rows Controls Section
         */
        if(sliderRows) {
            sliderRows.addEventListener('input', function () {
                valueDisplayRows.textContent = this.value;
                const event = new CustomEvent('hexDimensionUpdate', {
                    detail: {
                        cols: sliderCols.value,
                        rows: sliderRows.value
                    },
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            });
        }


        /**
         * Radius Control Section
         */
        if(radiusSize) {
            radiusSize.addEventListener('input', function () {
                radiusDisplay.textContent = this.value;
                const event = new CustomEvent('hexRadiusUpdate', {
                    detail: {
                        radius: (radiusSize.value / 10)
                    },
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            })
        }
    }

    decrementCols(){
        const colControl = document.getElementById('map-col-control');
        const cols = parseInt(colControl.value);
        if(cols > colControl.min){
            colControl.value = cols - 1;
            this.updateMapColValue(colControl.value);
        }
    }
    incrementCols(){
        const colControl = document.getElementById('map-col-control');
        const cols = parseInt(colControl.value);
        if(cols < colControl.max){
            colControl.value = cols + 1;
            this.updateMapColValue(colControl.value);
        }
    }
    decrementRows(){
        const rowControl = document.getElementById('map-row-control');
        const rows = parseInt(rowControl.value);
        if(rows > rowControl.min){
            rowControl.value = rows - 1;
            this.updateMapRowValue(rowControl.value);
        }
    }
    incrementRows(){
        const rowControl = document.getElementById('map-row-control');
        const rows = parseInt(rowControl.value);
        if(rows < rowControl.max){
            rowControl.value = rows + 1;
            this.updateMapRowValue(rowControl.value);
        }
    }
    decrementHexRadius(){
        const radiusControl = document.getElementById("map-hex-radius-control");
        const radius = parseInt(radiusControl.value);
        if(radius > radiusControl.min){
            radiusControl.value = radius - 1;
            this.updateHexRadius(radiusControl.value);
        }
    }
    incrementHexRadius(){
        const radiusControl = document.getElementById("map-hex-radius-control");
        const radius = parseInt(radiusControl.value);
        if(radius < radiusControl.max){
            radiusControl.value = radius + 1;
            this.updateHexRadius(radiusControl.value);
        }
    }

    updateHexRadius(value){
        document.getElementById("map-hex-radius-value").textContent = value;
        this.dispatch("hexRadiusUpdate", {
            detail:{
                radius: parseInt(value) / 10
            },
            bubbles: true
        });
    }

    updateMapColValue(value) {
        document.getElementById('map-col-value').textContent = value;
        this.dispatch("hexDimensionUpdate", {
            detail:{
                cols: parseInt(value)
            },
            bubbles: true
        });
    }

    updateMapRowValue(value) {
      document.getElementById('map-row-value').textContent = value;
      this.dispatch("hexDimensionUpdate", {
            detail:{
                rows: parseInt(value)
            },
            bubbles: true
        });
    }

    loadPreview(event){
        event.preventDefault()
        const mapId = event.currentTarget.dataset.mapId;
        const isGM = event.currentTarget.dataset.isGm;

        console.log("is gm?", event.currentTarget.dataset.isGm);

        if(isGM){
            this.enableEditButton(mapId);
        }
        this.enablePlayButton(mapId);

        fetch(`/maps/${mapId}/preview`, {
            headers: { 'Accept': 'text/html' }
        })
        .then(response => response.text())
        .then(html => {
            this.previewTarget.innerHTML = html
        })
    }

    enableEditButton(mapID){
        const editButton = document.querySelector('[data-id="edit-map"]')
        if (editButton) {
            editButton.href = `/maps/${mapID}/edit`
            editButton.classList.remove('btn-disabled')
        }
    }

    enablePlayButton(mapID){
        const playButton = document.querySelector('[data-id="play-map"]')
        if (playButton){
            playButton.href = `/maps/${mapID}`
            playButton.classList.remove('btn-disabled')
        }
    }

    resetEditPanes(){
        document.getElementById("map-info").classList.remove("hidden")
        document.getElementById("controls").classList.add("hidden")
        document.getElementById("hex-controls").classList.add("hidden")
        document.getElementById("region-controls").classList.add("hidden")
        document.getElementById("map-controls").classList.add("hidden")
        document.getElementById("hex-flyout-section").classList.add("hidden")

        document.getElementById("edit-map-button").classList.remove("hidden")
        document.getElementById("manage-regions-button").classList.remove("hidden")
        document.getElementById("hexes-edit-button").textContent = "Manage Hexes"

        // Switch to hex editing view
        document.getElementById("normal-map-view").classList.remove("hidden")
        document.getElementById("hex-edit-view").classList.add("hidden")

        // Close the fly-out window
        document.getElementById("admin-drawer").ariaLabel = "close sidebar";
    }

    showMapEditPane(){
        document.getElementById("map-info").classList.add("hidden")
        document.getElementById("controls").classList.remove("hidden")
        document.getElementById("hex-controls").classList.add("hidden")
        document.getElementById("region-controls").classList.add("hidden")
        document.getElementById("map-controls").classList.remove("hidden")

        // Switch to hex editing view
        document.getElementById("normal-map-view").classList.add("hidden")
        document.getElementById("hex-edit-view").classList.remove("hidden")

        // Close the fly-out window
        document.getElementById("admin-drawer").checked = false;

        // Dispatch event to show the hex map
        this.dispatch("hexDimensionUpdate", {
            bubbles: true
        });
    }

    updateHexTransform(){
        const offsetX = parseFloat(document.getElementById("position_x").value)
        const offsetY = parseFloat(document.getElementById("position_y").value)
        const scaleX = parseFloat(document.getElementById("scale_x").value)
        const scaleY = parseFloat(document.getElementById("scale_y").value)

        this.dispatch('hexTransform', {
            detail: {
                offsetX: offsetX,
                offsetY: offsetY,
                scaleX: scaleX,
                scaleY: scaleY
            },
            bubbles: true
        });
    }

    async saveMap(){
        // Get values from sliders
        const columnCount = document.getElementById('map-col-control').value
        const rowCount = document.getElementById('map-row-control').value
        const hexRadius = document.getElementById('map-hex-radius-control').value / 10 // Need a better way to use this value instead of dividing it by 10 everywhere

        const mapData = {
            columns: columnCount,
            rows: rowCount,
            hex_radius: hexRadius,
        }

        try{
            const response = await fetch(`/maps/${this.mapIdValue}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ map: mapData })
            });

            if (response.ok) {
                console.log('Map updated successfully');

                // only save player to map if the map itself was saved successfully
                await this.savePlayer(true);
            } else {
                console.error('Failed to update map');
            }
        }catch (e){
            console.error('Error updating map:', e);
        }
    }

    async savePlayer(isGM){
        const playerData = {
            player_id: this.playerIdValue,
            gm: isGM
        }

        try{
            const response = await fetch(`/maps/${this.mapIdValue}/player_maps`, {
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
    }
}