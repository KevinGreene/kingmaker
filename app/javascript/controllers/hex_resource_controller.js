import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static targets = ["newResourceList", "allocatedResourceList"];
    static values = {
        map: Object,
        resourceId: Number
    };

    connect(){
        // Variables
        this.currentHex = null;
        this.assignedResources = [];

        // event listeners
        document.addEventListener("hex-details:hexSelected", (event) => this.setupModal(event.detail.hex));
    }

    addResource(event) {
        const selectedResourceId = event.target.value;

        if (!selectedResourceId || selectedResourceId === "") {
            return;
        }

        const resource = Object.values(this.mapValue.resources).find(r => r.id == selectedResourceId);

        if (!resource) {
            console.error("Resource not found:", selectedResourceId);
            return;
        }

        // 1. Remove from new list
        this.updateNewResourceList(resource);

        // 2. Add to assigned list
        this.addToAssignedList(resource);

        // 3. Add to assignedResources array
        this.assignedResources.push(resource);

        // 4. Save to database, broadcasting if successful
        this.assignResource(resource).then(r => this.broadcastChanges());

        // Reset the select to the default option
        event.target.selectedIndex = 0;
    }

    removeResource(event) {
        const resourceId = event.target.dataset.resourceId;

        if (!resourceId) {
            console.error("No resource ID found on button");
            console.log("event", event);
            console.log("target", event.target);
            console.log("dataset", event.target.dataset);
            return;
        }

        const resource = Object.values(this.mapValue.resources).find(r => r.id == resourceId);

        if (!resource) {
            console.error("Resource not found:", resourceId);
            return;
        }

        // Remove from UI first
        event.target.closest('div').remove();

        // Remove from assignedResources array
        this.assignedResources = this.assignedResources.filter(r => r.id != resourceId);

        // Update the new resource list to include this resource again
        this.updateNewResourceListAfterRemoval(resource);

        // Save to database, broadcasting if successful
        this.unassignResource(resource).then(() => this.broadcastChanges());
    }

    updateNewResourceList(assignedResource) {
        const currentHex = this.getCurrentHex(); // You'll need to store this
        let newHtml = '<option disabled selected>Assign a New Resource</option>';

        for (const resource of Object.values(this.mapValue.resources)) {
            const hexResources = currentHex.resources || [];
            const isAlreadyAssigned = hexResources.some(hexResource => hexResource.id === resource.id);
            const isJustAssigned = resource.id === assignedResource.id;

            if (!isAlreadyAssigned && !isJustAssigned) {
                newHtml += `<option value="${resource.id}">${resource.name}</option>`;
            }
        }
        this.newResourceListTarget.innerHTML = newHtml;
    }

    updateNewResourceListAfterRemoval(removedResource) {
        const currentHex = this.getCurrentHex();
        let newHtml = '<option disabled selected>Assign a New Resource</option>';

        for (const resource of Object.values(this.mapValue.resources)) {
            // Check if resource is in the current assignedResources array
            const isStillAssigned = this.assignedResources.some(assignedResource =>
                assignedResource.id === resource.id
            );

            if (!isStillAssigned) {
                newHtml += `<option value="${resource.id}">${resource.name}</option>`;
            }
        }
        this.newResourceListTarget.innerHTML = newHtml;
    }

    addToAssignedList(resource) {
        const newResourceHtml = this.allocatedResourceTemplate(resource.id, resource.name);
        this.allocatedResourceListTarget.innerHTML += newResourceHtml;
    }

    setupModal(hex) {
        this.currentHex = hex;

        // Initialize/reset assignedResources array
        this.assignedResources = [];

        let newHtml = "<option disabled selected>Assign a New Resource</option>\n";
        let allocatedHtml = "";
        let allocatedResources = [];
        let newResources = [];

        if (hex.resources && hex.resources.length > 0) {
            for (const resource of Object.values(this.mapValue.resources)) {
                if (hex.resources.some(hexResource => hexResource.id === resource.id)) {
                    allocatedResources.push(resource);
                    // Add to assignedResources array
                    this.assignedResources.push(resource);
                } else {
                    newResources.push(resource);
                }
            }
        } else {
            // If no resources assigned, all resources are available
            for (const resource of Object.values(this.mapValue.resources)) {
                newResources.push(resource);
            }
        }

        for (const resource of newResources) {
            newHtml += this.newResourceListTemplate(resource);
        }

        for (const resource of allocatedResources) {
            allocatedHtml += this.allocatedResourceTemplate(resource);
        }

        this.newResourceListTarget.innerHTML = newHtml;
        this.allocatedResourceListTarget.innerHTML = allocatedHtml;
    }



    /**
     * SAVING
     */

    async assignResource(resource) {
        const currentHex = this.getCurrentHex();

        try {
            const response = await fetch(`/maps/${this.mapValue.id}/hexes/${currentHex.id}/assign_resource`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    resource_id: resource.id
                })
            });
            if (!response.ok) {
                throw new Error('Failed to save resource assignment');
            }
        } catch (error) {
            console.error('Error saving resource assignment:', error);
            // TODO: Revert UI Changes - this was an error
        }
    }

    async unassignResource(resource) {
        const currentHex = this.getCurrentHex();
        try {
            const response = await fetch(`/maps/${this.mapValue.id}/hexes/${currentHex.id}/unassign_resource`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    resource_id: resource.id
                })
            });
            if (!response.ok) {
                throw new Error('Failed to save resource assignment');
            }
        } catch (error) {
            console.error('Error saving resource assignment:', error);
            // TODO: Revert UI Changes - this was an error
        }
    }

    /**
     * HELPER METHODS
     */
    getCurrentHex() {
        return this.currentHex;
    }

    getAssignedResources(){
        return this.assignedResources;
    }

    broadcastChanges() {
        // Make sure we're broadcasting the current state
        const currentHex = this.getCurrentHex();
        const assignedResources = this.getAssignedResources();

        console.log("Broadcasting changes:", {
            hex: currentHex,
            resources: assignedResources
        });

        this.dispatch("resourcesUpdated", {
            detail: {
                hex: currentHex,
                resources: assignedResources,
                // Optional: include hex ID for easier identification by listeners
                hexId: currentHex.id
            },
            bubbles: true
        });
    }

    allocatedResourceTemplate(resource) {
        return `
        <div class="p-2 my-1 rounded-xl group flex flex-row border-y border-neutral content-center align-middle hover hover:bg-base-300">
            <div class="content-center align-middle text-center">${resource.name}</div>
            <div class="w-full"></div>
            <button class="btn btn-square btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition" 
                            data-action="click->hex-resources#removeResource"
                            data-resource-id="${resource.id}">
                <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="red" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        `
    }

    newResourceListTemplate(resource){
        return `
            <option value="${resource.id}">${resource.name}</option>
        `
    }
}