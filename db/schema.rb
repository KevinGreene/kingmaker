# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_06_22_193725) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "hex_resources", force: :cascade do |t|
    t.integer "hex_id", null: false
    t.integer "resource_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["hex_id"], name: "index_hex_resources_on_hex_id"
    t.index ["resource_id"], name: "index_hex_resources_on_resource_id"
  end

  create_table "hexes", force: :cascade do |t|
    t.integer "x_coordinate"
    t.integer "y_coordinate"
    t.string "label"
    t.boolean "reconnoitered", default: false
    t.boolean "claimed", default: false
    t.boolean "visible", default: false
    t.integer "map_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "region_id"
    t.index ["map_id"], name: "index_hexes_on_map_id"
    t.index ["region_id"], name: "index_hexes_on_region_id"
  end

  create_table "kingdoms", force: :cascade do |t|
    t.integer "ore"
    t.integer "food"
    t.integer "lumber"
    t.integer "luxuries"
    t.integer "stone"
    t.integer "resource_points"
    t.integer "map_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["map_id"], name: "index_kingdoms_on_map_id"
  end

  create_table "maps", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "columns"
    t.integer "rows"
    t.float "hex_scale"
    t.float "image_scale_horizontal"
    t.float "image_scale_vertical"
    t.integer "offset_x"
    t.integer "offset_y"
    t.string "description"
  end

  create_table "notes", force: :cascade do |t|
    t.string "content"
    t.integer "player_id", null: false
    t.boolean "private"
    t.integer "hex_id"
    t.integer "map_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["hex_id"], name: "index_notes_on_hex_id"
    t.index ["map_id"], name: "index_notes_on_map_id"
    t.index ["player_id"], name: "index_notes_on_player_id"
  end

  create_table "player_maps", force: :cascade do |t|
    t.integer "player_id", null: false
    t.integer "map_id", null: false
    t.boolean "gm"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["map_id"], name: "index_player_maps_on_map_id"
    t.index ["player_id"], name: "index_player_maps_on_player_id"
  end

  create_table "players", force: :cascade do |t|
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_players_on_user_id"
  end

  create_table "regions", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "map_id", null: false
    t.index ["map_id"], name: "index_regions_on_map_id"
  end

  create_table "resources", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "sessions", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "ip_address"
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "hex_resources", "hexes"
  add_foreign_key "hex_resources", "resources"
  add_foreign_key "hexes", "maps"
  add_foreign_key "hexes", "regions"
  add_foreign_key "kingdoms", "maps"
  add_foreign_key "notes", "hexes"
  add_foreign_key "notes", "maps"
  add_foreign_key "notes", "players"
  add_foreign_key "player_maps", "maps"
  add_foreign_key "player_maps", "players"
  add_foreign_key "players", "users"
  add_foreign_key "regions", "maps"
  add_foreign_key "sessions", "users"
end
