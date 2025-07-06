import { Application } from "@hotwired/stimulus"
const application = Application.start();

import MapController from "./maps_controller";
application.register("maps", MapController);

import MapPlayController from "./map_play_controller";
application.register("map-play", MapPlayController);

import HexController from "./hex_controller";
application.register("hexes", HexController);

import RegionController from "./region_controller";
application.register("regions", RegionController);

import HexEditorController from "./hex_editor_controller";
application.register("hex-editor", HexEditorController);

import MapLinkController from "./map_link_controller";
application.register("map-link", MapLinkController);

import MapFormController from "./map_form_controller";
application.register("map-form", MapFormController);

import MapShareController from "./map_share_controller";
application.register("map-share", MapShareController);

export { application }