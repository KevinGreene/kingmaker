import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = {

    }
    static values = {

    }

    toggleJoinMapForm() {
        const form = document.getElementById('join-map-form');
        const buttons = document.querySelector('.modal-action');
        const initialForm = document.getElementById("initial-form");
        const title = document.getElementById("card-title");

        if (form.classList.contains('hidden')) {
            form.classList.remove('hidden');
            buttons.classList.add('hidden');
            initialForm.classList.add("hidden");
            title.textContent = "Link to an Existing Map";
        } else {
            form.classList.add('hidden');
            buttons.classList.remove('hidden');
            initialForm.classList.remove("hidden");
            title.textContent = "Create or Join a Map";
        }
    }

    cancelJoinMap() {
        const input = document.getElementById('map-id-input');
        input.value = '';
        this.toggleJoinMapForm();
    }

    acceptJoinMap() {
        const mapId = document.getElementById('map-id-input').value;

        if (mapId.trim() === '') {
            alert('Please enter a Map ID');
            return;
        }

        // TODO: Implement join map logic here
        console.log('Joining map with ID:', mapId);

        // For now, just close the modal
        document.getElementById('new-map-modal').checked = false;
        this.cancelJoinMap();
    }
}