import { bbox, distance } from '@turf/turf'

export function getZoomCenterBounds(geojson, mapWidth, mapHeight) {
  // bounds should be a GeoJSON Feature<Polygon> or an array [west, south, east, north]
  let bounds = bbox(geojson)

  const [west, south, east, north] = bounds

  // Calculate the diagonal distance of the bounding box in kilometers
  const diagonalDistance = distance(
      [west, south],
      [east, north],
      { units: 'kilometers' },
  )

  // Calculate the center of the bounding box
  const center = [(west + east) / 2, (south + north) / 2]

  // Estimate zoom based on diagonal distance and map dimensions.
  // This is a heuristic approach and might need adjustments based on your specific needs.
  // We use a logarithmic scale to relate distance to zoom level.

  // Calculate the maximum possible distance that can be displayed on the map
  // based on the smaller dimension (width or height) to ensure the entire
  // bounding box is visible.  We assume a world size of 40,075 km (Earth's circumference).
  const maxMapDimension = Math.min(mapWidth, mapHeight)
  const maxPossibleDistance = 40075 * (maxMapDimension / 1024) // 256 is a common tile size

  let zoom = Math.log2(maxPossibleDistance / diagonalDistance) + 1

  // Clamp the zoom level to a reasonable range (e.g., 0-20)
  zoom = Math.max(0, Math.min(20, zoom))

  return {
    zoom,
    center,
    bounds: [west, south, east, north],
  }
}

let previousCameraPosition

export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

export function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

