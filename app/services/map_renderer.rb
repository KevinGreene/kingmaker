class MapRenderer
  require "chunky_png"

  def initialize(map)
    @map = map
  end

  def render_complete_map
    # Get base map image dimensions
    base_image = get_base_image
    return nil unless base_image

    # Create working image from base map
    image = base_image.dup

    # Draw all hexes grouped by region
    draw_hexes_on_image(image)

    # Save the rendered image
    save_rendered_image(image)
  end

  private

  def get_base_image
    return nil unless @map.image.attached?

    # Create a temporary file and download directly to it
    temp_file = Tempfile.new([ "original_map", ".tmp" ])
    temp_file.binmode

    # Download blob data directly to temp file
    @map.image.blob.download do |chunk|
      temp_file.write(chunk)
    end
    temp_file.close

    # Check if it's JPEG by reading the first few bytes
    File.open(temp_file.path, "rb") do |file|
      magic_bytes = file.read(2)
      file.rewind

      if magic_bytes == "\xFF\xD8".b  # JPEG magic bytes
        Rails.logger.info "Detected JPEG image, converting to PNG"
        convert_jpeg_to_png(temp_file.path)
      else
        Rails.logger.info "Assuming PNG image, loading directly"
        ChunkyPNG::Image.from_file(temp_file.path)
      end
    end
  ensure
    temp_file&.unlink  # Clean up temp file
  end

  def is_jpeg?(data)
    # Check for JPEG magic bytes at start of data
    if data.is_a?(String)
      data.force_encoding("BINARY").start_with?("\xFF\xD8".force_encoding("BINARY"))
    else
      # Reset position and read first 2 bytes
      data.rewind if data.respond_to?(:rewind)
      first_bytes = data.read(2)
      data.rewind if data.respond_to?(:rewind)
      first_bytes.force_encoding("BINARY") == "\xFF\xD8".force_encoding("BINARY")
    end
  end

  def convert_jpeg_to_png(jpeg_file_path)
    require "mini_magick"

    # Convert JPEG file to PNG
    image = MiniMagick::Image.open(jpeg_file_path)
    temp_png = Tempfile.new([ "map_converted", ".png" ])
    temp_png.close

    image.format("png")
    image.write(temp_png.path)

    # Load the converted PNG with ChunkyPNG
    result = ChunkyPNG::Image.from_file(temp_png.path)

    # Cleanup
    temp_png.unlink

    result
  rescue => e
    Rails.logger.error "JPEG conversion failed: #{e.message}"
    raise e
  end

  def draw_hexes_on_image(image)
    # Group hexes by region for consistent coloring
    @map.hexes.includes(:region).group_by(&:region).each do |region, hexes|
      color = region_color(region)

      hexes.each do |hex|
        draw_hex(image, hex, color)
      end
    end
  end

  def draw_hex(image, hex, color)
    # Use your actual positioning formula
    center_x = (@map.hex_scale_x * 40 * hex.x_coordinate) + @map.offset_x
    center_y = (@map.hex_scale_y * 40 * hex.y_coordinate) + @map.offset_y

    # Use a fixed hex size (you can adjust this)
    radius = 18  # This gives roughly 40px hex width

    # Generate hexagon points
    points = []
    6.times do |i|
      angle = (Math::PI / 3) * i
      x = center_x + (radius * Math.cos(angle)).round
      y = center_y + (radius * Math.sin(angle)).round
      points << [ x, y ]
    end

    # Draw hexagon outline
    draw_polygon_outline(image, points, color)
  end

  def draw_polygon_outline(image, points, color)
    # Draw lines between consecutive points
    points.each_with_index do |point, i|
      next_point = points[(i + 1) % points.length]
      draw_line(image, point[0], point[1], next_point[0], next_point[1], color)
    end
  end

  def draw_line(image, x0, y0, x1, y1, color)
    # Simple line drawing using Bresenham's algorithm
    dx = (x1 - x0).abs
    dy = (y1 - y0).abs
    sx = x0 < x1 ? 1 : -1
    sy = y0 < y1 ? 1 : -1
    err = dx - dy

    x, y = x0, y0

    loop do
      # Set pixel if within image bounds
      if x >= 0 && x < image.width && y >= 0 && y < image.height
        image[x, y] = color
      end

      break if x == x1 && y == y1

      e2 = 2 * err
      if e2 > -dy
        err -= dy
        x += sx
      end
      if e2 < dx
        err += dx
        y += sy
      end
    end
  end

  def region_color(region)
    # Default colors - you can customize this based on your Region model
    if region.nil?
      ChunkyPNG::Color.rgb(128, 128, 128) # Gray for no region
    else
      # You can add a color field to your Region model, or use a hash lookup
      case region.id % 6
      when 0 then ChunkyPNG::Color.rgb(255, 0, 0)     # Red
      when 1 then ChunkyPNG::Color.rgb(0, 255, 0)     # Green
      when 2 then ChunkyPNG::Color.rgb(0, 0, 255)     # Blue
      when 3 then ChunkyPNG::Color.rgb(255, 255, 0)   # Yellow
      when 4 then ChunkyPNG::Color.rgb(255, 0, 255)   # Magenta
      when 5 then ChunkyPNG::Color.rgb(0, 255, 255)   # Cyan
      end
    end
  end

  def save_rendered_image(image)
    # Create public/maps directory if it doesn't exist
    maps_dir = Rails.root.join("public", "maps")
    FileUtils.mkdir_p(maps_dir)

    # Save with version timestamp for cache busting
    filename = "#{@map.id}_v#{@map.updated_at.to_i}.png"
    filepath = maps_dir.join(filename)

    image.save(filepath.to_s)

    # Store the filename so we can reference it later
    @rendered_filename = filename
    filepath.to_s
  end

  def rendered_filename
    @rendered_filename
  end
end
