import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = {

    }
    static values = {

    }

    toggleJoinMapForm() {
        // _new partial
        const form = document.getElementById('join-map-form');
        const buttons = document.querySelector('.modal-action');
        const initialForm = document.getElementById("initial-form");
        const title = document.getElementById("card-title");

        if(form != null){
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
    }

    cancelJoinMap() {
        const input = document.getElementById('map-link-input');
        input.value = '';
        this.toggleJoinMapForm();
    }

    acceptJoinMap() {
        const link = document.getElementById('map-link-input').value.toString();
        const modal = document.getElementById('new-map-modal');

        if (link.trim() === '') {
            alert('Please enter a Map ID');
            return;
        }

        fetch('/join_map', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({
                share_token: link.trim()
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Close modal and redirect or refresh
                if(modal != null){
                    modal.checked = false;
                }
                this.cancelJoinMap();
                // Redirect to the map
                window.location.href = `/maps/${data.map_id}`;
            } else {
                alert('Error: ' + data.errors.join(', '));
            }
        })
        .catch(error => {
            console.error('Error joining map:', error);
            alert('An error occurred while joining the map');
        });
    }

    previewMap(){
        const link = document.getElementById('map-link-input').value.toString();

        if (link.trim() === '') {
            alert('Please enter a Map ID');
            return;
        }

        fetch(`/preview_by_link?share_token=${encodeURIComponent(link.trim())}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Redirect to the map
                window.location.href = `/maps/${data.map_id}?share_token=${link.trim()}`;
            } else {
                alert('Error: ' + data.errors.join(', '));
            }
        })
        .catch(error => {
            console.error('Error joining map:', error);
            alert('An error occurred while joining the map');
        });
    }
}