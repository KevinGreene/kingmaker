// Import and register all your controllers from the importmap via controllers/**/*_controller
import { Application } from "@hotwired/stimulus"
const application = Application.start()

import TabsController from "./tabs_controller"
application.register("tabs", TabsController);

export { application }