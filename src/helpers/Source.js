// Source.js

import { MAP } from '@src/MapManger.js'
import { getZoomCenterBounds } from '@src/helpers/MapHelper.js'

class Source {
  constructor(options = {}) {
    this.id = options.id
    this.type = options.type
    this.url = options.url
    this.data = options.data
    this.bounds = options.bounds
    this.center = options.center
    this.zoom = options.zoom
    this.onLoad = options.onLoad || function () {
    }
    this.onResize = options.onResize || function () {
    }
  }

  addSourceToMap(options = {}) {
    MAP.addSource(this.id, {
      'type': 'geojson',
      data: this.data,
      ...options
    })
  }

  measureDataBounds(geojson) {
    const measure = getZoomCenterBounds(geojson || this.data, window.innerWidth, window.innerHeight)
    this.bounds = measure.bounds
    this.center = measure.center
    this.zoom = measure.zoom
  }

  loaded() {
    this.onLoad(this)
  }

  resized() {
    this.onResize(this)
  }

}

export default Source
