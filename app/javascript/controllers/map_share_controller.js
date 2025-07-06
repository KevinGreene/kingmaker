import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static values = {
        mapId: Number
    }

    copyShareToken() {
      const input = document.getElementById('share_token_' + this.mapIdValue);
      const button = document.getElementById('copy_btn_' + this.mapIdValue);

      navigator.clipboard.writeText(input.value).then(() => {
        button.disabled = true;
        button.innerHTML = '<em>Copied!</em>';
        button.classList.remove('btn-primary');
        button.classList.add('btn-disabled');

        // Reset after 2 seconds
        setTimeout(() => {
          button.disabled = false;
          button.innerHTML = 'Copy Token';
          button.classList.remove('btn-disabled');
          button.classList.add('btn-primary');
        }, 2000);
      });
    }
}
