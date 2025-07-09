import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static values = {
        mapId: Number,
        playerId: Number,
        isGm: Boolean
    };
    static targets = ["preview"];

    loadPreview(event){
        event.preventDefault()
        const mapId = event.currentTarget.dataset.mapId;
        const isGM = event.currentTarget.dataset.isGm;

        if(isGM === "true"){
            this.enableEditButton(mapId);
        } else {
            this.disableEditButton();
        }
        this.enablePlayButton(mapId);

        fetch(`/maps/${mapId}/preview`, {
            headers: { 'Accept': 'text/html' }
        })
        .then(response => response.text())
        .then(html => {
            this.previewTarget.innerHTML = html
        });

        // const Thumbnail properties
        const defaultThumbnailClassList = ['bg-base-100', 'hover:bg-base-200', 'shadow-md'];
        const selectedThumbnailClassList = ['bg-neutral', 'border', 'border-neutral-500', 'shadow-xl'];

        // deselect all thumbnails
        const allThumbnails = document.querySelectorAll(".map-thumbnail");
            allThumbnails.forEach(thumbnail => {
                thumbnail.classList.remove(...selectedThumbnailClassList);
                thumbnail.classList.add(...defaultThumbnailClassList);
            });

        const targetId = "thumbnail-" + mapId;
        const targetThumbnail = document.getElementById(targetId);
        if(targetThumbnail != null){
            targetThumbnail.classList.remove(...defaultThumbnailClassList);
            targetThumbnail.classList.add(...selectedThumbnailClassList);
        }

    }

    enableEditButton(mapID){
        const editButton = document.querySelector('[data-id="edit-map"]')
        if (editButton) {
            editButton.href = `/maps/${mapID}/edit`
            editButton.classList.remove('btn-disabled')
        }
    }

    disableEditButton(){
        const editButton = document.querySelector('[data-id="edit-map"]');
        if(editButton){
            editButton.href = '';
            editButton.classList.add('btn-disabled');
        }
    }

    enablePlayButton(mapID){
        const playButton = document.querySelector('[data-id="play-map"]')
        if (playButton){
            playButton.href = `/maps/${mapID}`
            playButton.classList.remove('btn-disabled')
        }
    }
}