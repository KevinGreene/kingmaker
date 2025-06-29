// Import and register all your controllers from the importmap via controllers/**/*_controller
import { Application } from "@hotwired/stimulus";
const application = Application.start();

/**
 * To register a new controller, follow this naming convention:
 * import ChooseAnyName from "./path/to/controller.js"
 * application.register("controller-name-kebab-case", ChooseAnyName);
 *
 * Note that the "controller-name-kebab-case" must match your controller javaclass name,
 * but without the word "controller" at the end, and in kebab-case instead of snake_case.
 */
import TabsController from "./tabs_controller";
application.register("tabs", TabsController);

import MapController from "./maps_controller";
application.register("maps", MapController);

export { application }