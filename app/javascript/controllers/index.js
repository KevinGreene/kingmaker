// Import and register all your controllers from the importmap via controllers/**/*_controller
import { Application } from "@hotwired/stimulus"
const application = Application.start()

import TabsController from "./tabs_controller"
application.register("tabs", TabsController)

import MapController from "./maps_controller"
application.register("maps", MapController)

import MapPlayController from "./map_play_controller"
application.register("map-play", MapPlayController)

import HexController from "./hex_controller"
application.register("hexes", HexController)

import RegionController from "./region_controller"
application.register("regions", RegionController)

import HexEditorController from "./hex_editor_controller"
application.register("hex-editor", HexEditorController)

export { application }