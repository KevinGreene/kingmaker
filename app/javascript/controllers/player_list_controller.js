import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static targets = [ "playersList" ];
    static values = {
        map: Array
    }

    connect(){
        this.playersListTarget.innerHTML = this.getInnerHTML();
    }

    getInnerHTML(){
        let finalHTML = "";

        this.mapValue.forEach(playerMap => {
          // Move these lines INSIDE the forEach loop
          const userInfo = playerMap.player.user.safe_json_attributes;
          const avatarUrl = userInfo.icon || '/images/default-avatar.png';

          console.log(playerMap.player.user.email_address);
          console.log(userInfo.display_name); // Use userInfo instead
          console.log(userInfo.icon); // Use userInfo instead

          finalHTML += this.innerHTML(userInfo, avatarUrl);
        });
        return finalHTML;
    }

    /**
     * Helper Methods
     */

    innerHTML(userInfo, avatarUrl){
        return `
          <div class="card-body flex-row">
            <div class="avatar">
              <div class="rounded w-32">
                <img src="${avatarUrl}" alt="${userInfo.display_name}" />
              </div>
            </div>
            <h3>${userInfo.display_name}</h3>
          </div>
        `
    }
}