import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["tab", "content"]

    switch(event) {
        event.preventDefault()

        console.log("tabs controller js class is called");

        const clickedTab = event.currentTarget

        // Remove active from all tabs
        this.tabTargets.forEach(tab => {
            tab.classList.remove('tab-active')
        })

        // Add active to clicked tab
        clickedTab.classList.add('tab-active')

        // Hide all content
        this.contentTargets.forEach(content => {
            content.classList.add('hidden')
        })

        // Show selected content
        const tabId = clickedTab.dataset.tab
        if (tabId) {
            const targetContent = document.getElementById(tabId)
            if (targetContent) {
                targetContent.classList.remove('hidden')
            }
        }
    }
}