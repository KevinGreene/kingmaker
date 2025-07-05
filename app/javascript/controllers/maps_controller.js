import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static targets = ["preview"];

    connect(){
        const sliderCols = document.getElementById('map-col-control');
        const valueDisplayCols = document.getElementById('map-col-value');
        const sliderRows = document.getElementById('map-row-control');
        const valueDisplayRows = document.getElementById('map-row-value');
        const sliderColsDec = document.getElementById("map-col-control-dec");
        const sliderColsInc = document.getElementById("map-col-control-inc");
        const sliderRowsDec = document.getElementById("map-row-control-dec");
        const sliderRowsInc = document.getElementById("map-row-control-inc");

        /**
         * Columns Controls Section
         */
        sliderCols.addEventListener('input', function() {
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

        /**
         * Rows Controls Section
         */
        sliderRows.addEventListener('input', function() {
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

    updateMapColValue(value) {
        document.getElementById('map-col-value').textContent = value;
    }

    updateMapRowValue(value) {
      document.getElementById('map-row-value').textContent = value;
    }

    loadPreview(event){
        event.preventDefault()
        const mapId = event.currentTarget.dataset.mapId

        this.enableEditButton(mapId);
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
        document.getElementById("region-container").classList.remove("hidden")

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

}