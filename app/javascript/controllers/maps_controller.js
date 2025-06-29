import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static targets = ["preview"];

    loadPreview(event){
        event.preventDefault()
        const mapId = event.currentTarget.dataset.mapId

        fetch(`/maps/${mapId}/preview`, {
            headers: { 'Accept': 'text/html' }
        })
        .then(response => response.text())
        .then(html => {
            this.previewTarget.innerHTML = html
        })
    }
}