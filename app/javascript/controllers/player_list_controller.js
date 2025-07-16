import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static targets = [ "playersList" ];
    static values = {
        map: Array,
        currentPlayer: Array
    }

    connect(){
        this.updateModal();
    }

    updateModal(){
        this.playersListTarget.innerHTML = this.getInnerHTML();
    }

    getInnerHTML(){
        let gmHTML = "";
        let playerHTML = "";

        let gmAccess = false;
        this.currentPlayerValue.forEach(player => {
            if(player.gm) gmAccess = true;
        });

        this.mapValue.forEach(playerMap => {
          const userInfo = playerMap.player.user.safe_json_attributes;
          const playerMapGM = playerMap.gm;
          const avatarUrl = userInfo.icon || '/images/default-avatar.png';
          if(playerMapGM){
              gmHTML += this.innerHTML(userInfo, avatarUrl, playerMapGM, gmAccess, playerMap);
          } else {
              playerHTML += this.innerHTML(userInfo, avatarUrl, playerMapGM, gmAccess, playerMap);
          }
        });
        return gmHTML + playerHTML;
    }

    kick(event) {
        const mapId = event.target.dataset.mapId;
        const playerMapId = event.target.dataset.playerMapId;
        this.saveKickPlayer(mapId, playerMapId).then(r => {
            this.mapValue = this.mapValue.filter(playerMap =>
                playerMap.id.toString() !== playerMapId.toString()
            );
            this.updateModal();
        });
    }

    promoteToGM(event) {
        const mapId = event.target.dataset.mapId;
        const playerMapId = event.target.dataset.playerMapId;
        this.savePromotionToGM(mapId, playerMapId).then(r => {
            this.mapValue = this.mapValue.map(playerMap => {
                if (playerMap.id.toString() === playerMapId.toString()) {
                    return {...playerMap, gm: true};
                }
                return playerMap;
            });
            this.updateModal();
        });
    }

    /**
     * Helper Methods
     */

    async saveKickPlayer(mapId, playerMapId){
        console.log("map", mapId, "playerMapId", playerMapId);
        try{
            const response = await fetch(`/maps/${mapId}/player_maps/${playerMapId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                }
            });
            if(response.ok) {
                console.log("player was kicked!");
            } else {
                console.log("response was not OK when kicking player:", response);
            }
        } catch (error){
            console.log("failed to kick player:", error);
        }
    }

    async savePromotionToGM(mapId, playerMapId){
        try{
            const response = await fetch(`/maps/${mapId}/player_maps/${playerMapId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    gm: true
                })
            });
            if(response.ok) {
                console.log("saved player as GM successfully!");
            } else {
                console.log("response was not OK:", response);
            }
        } catch (error){
            console.log("failed to save player as GM:", error);
        }
    }

    innerHTML(userInfo, avatarUrl, playerMapGM, gmAccess, playerMap){
        return `
<div class="card card-compact bg-base-300 drop-shadow-md relative m-2">
  <div class="card-body">
    <div class="flex items-center gap-4">
      <div class="avatar">
        <div class="mask mask-squircle w-16 h-16">
          <img src="${avatarUrl}" alt="${userInfo.display_name}" />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <h3 class="text-lg font-bold text-base-content">${userInfo.display_name}</h3>
        <div class="flex items-center gap-2">
          ${playerMapGM ? 
            '<div class="flex items-center gap-2">\n' +
            '  <div class="relative">\n' +
            '    <svg class="w-3 h-3 text-primary" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
            '      <circle cx="6" cy="6" r="5" fill="currentColor"/>\n' +
            '    </svg>\n' +
            '    <svg class="absolute inset-0 w-3 h-3 text-primary animate-ping-less" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
            '      <circle cx="6" cy="6" r="5" fill="currentColor"/>\n' +
            '    </svg>\n' +
            '  </div>\n' +
            '  <span class="text-sm text-primary font-medium">Game Master</span>\n' +
            '</div>' : 
            '<div class="flex items-center gap-2">\n' +
            '<svg class="w-3 h-3 text-info animate-spin-slow" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
            '    <path d="M6 1L7.5 4.5L11 3L9 6L11 9L7.5 7.5L6 11L4.5 7.5L1 9L3 6L1 3L4.5 4.5Z" fill="currentColor"/>\n' +
            '  </svg>\n' +
            '  <span class="text-sm text-info font-medium">Player</span>\n' +
            '</div>'
          }
        </div>
      </div>
    </div>

    <div class="absolute bottom-4 right-4 flex flex-row gap-2">
    ${gmAccess && !playerMapGM ?
            `<button class="btn btn-xs btn-error text-white" data-player-map-id="${playerMap.id}" data-map-id="${playerMap.map_id}" data-action="player-list#kick">Kick Player</button>` +
            `<button class="btn btn-xs btn-outline btn-success" data-player-map-id="${playerMap.id}" data-map-id="${playerMap.map_id}" data-action="player-list#promoteToGM">Promote to GM</button>`
            :
            ''
        }
    </div>
  </div>
</div>
        `
    }
}