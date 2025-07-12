import { Application } from "@hotwired/stimulus"
const application = Application.start();

import MapController from "./maps_controller";
application.register("maps", MapController);

import MapPlayController from "./map_play_controller";
application.register("map-play", MapPlayController);

import HexController from "./hex_controller";
application.register("hexes", HexController);

/*
import HexEditorController from "./hex_editor_controller";
application.register("hex-editor", HexEditorController);
*/

import MapLinkController from "./map_link_controller";
application.register("map-link", MapLinkController);

import MapFormController from "./map_form_controller";
application.register("map-form", MapFormController);

import MapShareController from "./map_share_controller";
application.register("map-share", MapShareController);

import MapEditController from "./map_edit_controller";
application.register("map-edit", MapEditController);

import MapControlController from "./map_control_controller";
application.register("map-control", MapControlController);

import RegionController from "./region_controller";
application.register("regions", RegionController);

import HexDetailsController from "./hex_details_controller";
application.register("hex-details", HexDetailsController);

import ResourceController from "./resources_controller";
application.register("resources", ResourceController);

import HexResourceController from "./hex_resource_controller";
application.register("hex-resources", HexResourceController);

export { application }