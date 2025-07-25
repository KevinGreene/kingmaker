import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    connect(){
        // Modal Elements
        this.hexFlyout = document.getElementById("hex-details-flyout");
        this.hexName = document.getElementById("hex-name-display");
        this.hexCoordinates = document.getElementById("hex-coordinates-display");
        this.hexIsReconnoitered = document.getElementById("hex-reconnoitered");
        this.hexIsReconnoiteredText = document.getElementById("hex-reconnoitered-text");
        this.hexIsClaimed = document.getElementById("hex-claimed");
        this.hexIsClaimedText = document.getElementById("hex-claimed-text");
        this.hexRegion = document.getElementById("hex-region-display");
        this.hexNameChange = document.getElementById("hex-change-name");
        this.hexNameChangeValue = document.getElementById("hex-new-name-value");

        // Event Listeners
        document.addEventListener('map-edit:hexSelectionUpdate', (event) => this.selectHex(event.detail.hex));
        document.addEventListener('map-edit:hexDeselected', () => this.deselectHex());

        // Persistent variables
        this.selectedHex = null;
    }

    selectHex(hex){
        // set the persistent hex selection
        this.selectedHex = hex;

        // show the modal
        this.hexFlyout.classList.add("translate-x-0");
        this.hexFlyout.classList.remove("translate-x-full");

        // set labels
        this.hexName.textContent = hex.label;
        this.hexCoordinates.textContent = `( ${hex.x_coordinate}, ${hex.y_coordinate} )`
        this.hexIsReconnoitered.checked = hex.reconnoitered;
        this.hexIsReconnoiteredText.textContent = hex.reconnoitered.toString();
        this.hexIsClaimed.checked = hex.claimed;
        this.hexIsClaimedText.textContent = hex.claimed.toString();
        this.hexRegion.textContent = hex.region ? hex.region.name : "No Region Assigned";

        // dispatch event for other controllers
        this.dispatch("hexSelected", {
            detail: {
                hex: this.selectedHex
            },
            bubbles: true
        });
    }

    deselectHex(){
        // hide the modal
        this.hexFlyout.classList.remove("translate-x-0");
        this.hexFlyout.classList.add("translate-x-full");

        // reset labels?  is it ok to just leave them with previous hex' details?
    }

    hide(){
        this.dispatch("deselectAllHexes");
        this.deselectHex();
    }

    nameChange(){
        let newName = this.hexNameChangeValue.value;
        if(newName.length === 0){
            newName = this.hexCoordinates.textContent;
        }
        this.hexName.textContent = newName;
        this.dispatch("hexNameChange", {
            detail:{
                hex: this.selectedHex,
                newName: newName
            },
            bubbles: true
        });

        this.closeNameChange();
    }

    closeNameChange(){
        this.hexNameChange.open = false;
    }

    changeResource(event){
        const selectedResourceId = event.target.value

        if(selectedResourceId === "No Resource"){
            // unassign resource
            this.updateHexResource(null);
        } else {
            // assign selected resource
            this.updateHexResource(selectedResourceId);
        }
    }

    async updateHexResource(newResourceId){
        let url = "";
        let method = "";
        if(newResourceId === "No Resource"){
            url = `/maps/${this.selectedHex.map_id}/hexes/${this.selectedHex.id}/unassign_resource`;
            method = "DELETE";
        } else {
            url = `/maps/${this.selectedHex.map_id}/hexes/${this.selectedHex.id}/assign_resource`;
            method = "POST";
        }

        try{
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    resource_id: newResourceId
                })
            });
            if(!response.ok){
                console.error('failed to save hex', this.selectedHex);
            }
        } catch (error){
            console.log("error saving hex: ", this.selectedHex, error);
        }
        console.log(`hex ${this.selectedHex.id} saved successfully`);
    }

}