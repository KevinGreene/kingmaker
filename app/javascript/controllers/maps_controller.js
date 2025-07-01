import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static targets = ["preview"];

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
    }

}