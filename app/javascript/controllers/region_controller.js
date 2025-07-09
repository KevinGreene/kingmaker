import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    enableRegionEditPane(){
        document.getElementById("map-info").classList.add("hidden")
        document.getElementById("controls").classList.remove("hidden")
        document.getElementById("hex-controls").classList.add("hidden")
        document.getElementById("region-controls").classList.remove("hidden")
        document.getElementById("map-controls").classList.add("hidden")

        // Show regular map
        document.getElementById("normal-map-view").classList.remove("hidden")
        document.getElementById("hex-edit-view").classList.add("hidden")

        // Hide fly-out window
        document.getElementById("admin-drawer").checked = false;

        // dispatch event to generate hex SVG
        this.dispatch("drawHexes", {
            bubbles: true
        });
    }
}