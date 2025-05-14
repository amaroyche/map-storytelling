import mapboxgl, { Map } from 'mapbox-gl'
import { MAP_OPTIONS } from '@src/MapConfig.js'

/**
 * Mapbox instance Map
 * @type {Map}
 */
export let MAP = null

export function InitializeMap() {
  return new Promise((resolve) => {
    // initialize map with options
    MAP = new mapboxgl.Map(MAP_OPTIONS)

    // disable all interactions initially
    disableInteractions()

    // in addition, disable boxZoom and scroll separately not to be enabled ever
    MAP.boxZoom.disable()
    MAP.scrollZoom.disable()

    // add on load event
    MAP.on('load', resolve)
  })
}

export function disableInteractions() {
  MAP.dragRotate.disable()
  MAP.dragPan.disable()
  MAP.doubleClickZoom.disable()
  MAP.touchZoomRotate.disable()
  MAP.getContainer().classList.remove('interactions')
}

export function enableInteractions() {
  MAP.dragRotate.enable()
  MAP.dragPan.enable()
  MAP.doubleClickZoom.enable()
  MAP.touchZoomRotate.enable()
  MAP.getContainer().classList.toggle('interactions', true)
}