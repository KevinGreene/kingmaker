import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["map"]
    static values = {
        mapId: Number,
        hexCols: Number,
        hexRows: Number,
        hexRadius: Number
    }

    connect(){
        this.hexData = [];

        document.addEventListener('hexDimensionUpdate', (event) => this.regenerateHexes(event.detail));
        document.addEventListener('maps:hexDimensionUpdate', (event) => this.regenerateHexes(event.detail));
        document.addEventListener('hexRadiusUpdate', (event) => this.regenerateHexes(event.detail));
        document.addEventListener('maps:hexRadiusUpdate', (event) => this.regenerateHexes(event.detail));
    }

    regenerateHexes(detail){
        if(detail.cols != null){
            this.hexColsValue = detail.cols;
        } else {
            this.hexColsValue = parseInt(document.getElementById("map-col-control").value)
        }
        if(detail.rows != null){
            this.hexRowsValue = detail.rows;
        } else {
            this.hexRowsValue = parseInt(document.getElementById("map-row-control").value)
        }
        if(detail.radius != null){
            this.hexRadiusValue = detail.radius;
        } else {
            this.hexRadiusValue = (parseInt(document.getElementById("map-hex-radius-control").value) / 10)
        }
        this.generateHexes();
    }

    generateHexes() {
        this.hexData = [];

        // Generate hex coordinates
        for (let col = 0; col < this.hexColsValue; col++) {
            for (let row = 0; row < this.hexRowsValue; row++) {
                this.hexData.push({
                    map_id: this.mapIdValue,
                    x_coordinate: col,
                    y_coordinate: row,
                    reconnoitered: false,
                    claimed: false,
                    visible: true,
                    region_id: null,
                });
            }
        }

        this.dispatch('regenerateHexes', {
            detail: {
                hexes: this.hexData,
                radius: this.hexRadiusValue
            },
            bubbles: true,
            cancelable: true
        });
    }

    async createHexesInDatabase() {
        try {
            const response = await fetch(`/maps/${this.mapIdValue}/hexes/bulk_create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ hexes: this.hexData })
            });

            if (response.ok) {
                const result = await response.json();
            } else {
                console.error('Failed to create hexes');
            }
        } catch (error) {
            console.error('Error creating hexes:', error);
        }
    }

    toggleHexFlyout(){
        if(document.getElementById("hexes-edit-button").textContent === "Manage Hexes"){
            this.enableHexFlyout();
        } else {
            this.disableHexFlyout();
        }
    }

    enableHexFlyout(){
        document.getElementById("edit-map-button").classList.add("hidden");
        document.getElementById("manage-regions-button").classList.add("hidden");
        document.getElementById("hexes-edit-button").textContent = "Go Back";
        document.getElementById("region-container").classList.add("hidden");
        document.getElementById("hex-flyout-section").classList.remove("hidden");
    }

    disableHexFlyout(){
        document.getElementById("edit-map-button").classList.remove("hidden");
        document.getElementById("manage-regions-button").classList.remove("hidden");
        document.getElementById("hexes-edit-button").textContent = "Manage Hexes";
        document.getElementById("region-container").classList.remove("hidden");
        document.getElementById("hex-flyout-section").classList.add("hidden");
    }

    enableHexEditPane(){
        document.getElementById("map-info").classList.add("hidden");
        document.getElementById("controls").classList.remove("hidden");
        document.getElementById("hex-controls").classList.remove("hidden");
        document.getElementById("region-controls").classList.add("hidden");
        document.getElementById("map-controls").classList.add("hidden");

        // Switch to hex editing view
        document.getElementById("normal-map-view").classList.add("hidden");
        document.getElementById("hex-edit-view").classList.remove("hidden");

        // Reset and close the fly-out window
        this.disableHexFlyout();
        document.getElementById("admin-drawer").checked = false;
    }

    flipHexStyle(){
        const flipHexButton = document.getElementById("hex-style-switch");
        if(flipHexButton.textContent.charAt(0) === "⬢"){
            flipHexButton.textContent = "⬣";
        } else {
            flipHexButton.textContent = "⬢";
        }

        this.dispatch('hexStyleChange', {
          detail: {
            hexStyle: flipHexButton.textContent
          },
          bubbles: true
        });
    }

}