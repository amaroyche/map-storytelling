import Section from '@src/helpers/Section.js'
import Source from '@src/helpers/Source.js'
import { MAP } from '@src/MapManger.js'
import { along } from '@turf/turf'
import { lerp  } from '@src/helpers/MapHelper.js'
import { SOURCE_BY_ID } from '@src/DataManager.js'

export const DEBUG = import.meta.env.DEV && false
export const ANIMATION_FRAME_RATE = 30

export const TOKEN = 'pk.eyJ1IjoidmlsbGV3aWxzb24iLCJhIjoiY21hMDhobDY0MHR2dzJrczg1Mjk4NmQyaCJ9.1ivMnqW2XTSfy2nf1utCBQ'

export const MAP_OPTIONS = {
  container: 'map',
  style: 'mapbox://styles/villewilson/cm8xrkm1x000z01qr35gb2fer',
  center: [90.18741, 36.13885],
  zoom: 3,
}

const LAYER_ID = {
  CHINA_BOUNDS: 'layer-china-bounds',
  CHINA_PROVINCES_BOUNDS: 'layer-china-provinces-bounds',
  CHINA_PROVINCES_FILL: 'layer-china-provinces-fill',
  CHINA_XINJIANG_POINTS: 'layer-china-xinjiang-points',
  CHINA_FACTORIES_POINTS: 'china-factories-points',
  CHINA_ROUTE: 'layer-china-route',
  CHINA_ROUTE_LINE: 'layer-china-route-line',
  BUILDINGS: null,
}

const SOURCE_ID = {
  CHINA_BOUNDS: 'china-bounds',
  CHINA_PROVINCES: 'china-provinces',
  CHINA_XINJIANG_POINTS: 'china-xinjiang-points',
  CHINA_FACTORIES_POINTS: 'china-factories-points',
  CHINA_ROUTE: 'china-route',
  BUILDINGS: null,
}

/**
 *
 * @type {Source[]}
 */
export const DATA_SOURCES = [
  new Source({
    id: SOURCE_ID.CHINA_BOUNDS,
    type: 'json',
    url: '/china-boundary.geojson',
    onLoad: (source) => {
      source.addSourceToMap()
      source.measureDataBounds()
    },
    onResize: (source) => {
      source.measureDataBounds()
    },
  }),
  new Source({
    id: SOURCE_ID.CHINA_PROVINCES,
    type: 'json',
    url: '/china-provinces.geojson',
    onLoad: (source) => {
      source.addSourceToMap()
      // provide specific geojson (65 === xinjiang)
      let feature = source.data.features.find(feature => feature.properties.id === '65')
      source.measureDataBounds(feature)
      source.zoom -= 1 // manual offset
    },
    onResize: (source) => {
      // provide specific geojson (65 === xinjiang)
      let feature = source.data.features.find(feature => feature.properties.id === '65')
      source.measureDataBounds(feature)
      source.zoom -= 1 // manual offset
    },
  }),
  new Source({
    id: SOURCE_ID.CHINA_XINJIANG_POINTS,
    type: 'json',
    url: '/china-xinjiang-points.geojson',
    onLoad: (source) => {
      source.addSourceToMap()
      source.measureDataBounds()
    },
    onResize: (source) => {
      source.measureDataBounds()
    },
  }),
  new Source({
    id: SOURCE_ID.CHINA_ROUTE,
    type: 'json',
    url: '/china-route.geojson',
    onLoad: (source) => {
      source.addSourceToMap({
        lineMetrics: true, // Line metrics is required to use the 'line-progress' property
      })
      source.measureDataBounds()
    },
    onResize: (source) => {
      source.measureDataBounds()
    },
  }),
  new Source({
    id: SOURCE_ID.CHINA_FACTORIES_POINTS,
    type: 'json',
    url: '/china-factories.geojson',
    onLoad: (source) => {
      source.addSourceToMap()
      source.measureDataBounds()
    },
    onResize: (source) => {
      source.measureDataBounds()
    },
  }),

  // we could load txt file for some text contend
  // new Source({
  //   id: 'test-txt',
  //   type: 'txt',
  //   url: '/test.txt',
  //   data: null,
  //   onLoad: (source) => {
  //     if (DEBUG) console.log('data loaded', source.data)
  //   },
  // }),
]

export const CreateLayers = () => {
  return new Promise((resolve) => {
    MAP
        .addLayer({
          id: LAYER_ID.CHINA_BOUNDS,
          type: 'line',
          source: SOURCE_ID.CHINA_BOUNDS,
          paint: {
            'line-color': '#8d000c',
            'line-width': 3,
            'line-opacity': 0,
          },
        })
        .addLayer({
          id: LAYER_ID.CHINA_PROVINCES_BOUNDS,
          type: 'line',
          source: SOURCE_ID.CHINA_PROVINCES,
          paint: {
            'line-color': '#8d000c',
            'line-width': 2,
            'line-opacity': 0,
          },
        })
        .addLayer({
          id: LAYER_ID.CHINA_PROVINCES_FILL,
          type: 'fill',
          source: SOURCE_ID.CHINA_PROVINCES,
          paint: {
            'fill-color': '#8d000c',
            'fill-opacity': 0,
          },
        })
        .addLayer({
          id: LAYER_ID.CHINA_XINJIANG_POINTS,
          type: 'circle',
          source: SOURCE_ID.CHINA_XINJIANG_POINTS,
          paint: {
            'circle-radius': 6,
            'circle-opacity': 0,
            'circle-color': '#B42222',
          },
        })
        .addLayer({
          id: LAYER_ID.CHINA_ROUTE,
          type: 'circle',
          source: SOURCE_ID.CHINA_ROUTE,
          paint: {
            'circle-radius': 8,
            'circle-opacity': 0,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-opacity': 0,
            'circle-color': '#310006',
          },
          'filter': ['==', '$type', 'Point'],
        })
        .addLayer({
          id: LAYER_ID.CHINA_ROUTE_LINE,
          type: 'line',
          source: SOURCE_ID.CHINA_ROUTE,
          paint: {
            'line-color': 'rgba(0,0,0,0)', // note rgba
            'line-width': 6,
            'line-opacity': 0.8,
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          'filter': ['==', '$type', 'LineString'],
        })
        .addLayer({
          id: LAYER_ID.CHINA_FACTORIES_POINTS,
          type: 'circle',
          source: SOURCE_ID.CHINA_FACTORIES_POINTS,
          paint: {
            'circle-radius': 6,
            'circle-opacity': 0,
            'circle-color': '#B42222',
          },
        })

    resolve()
  })
}

/**
 *
 * @type {Section[]}
 */
export const SECTIONS = [
  new Section({
    id: '00_section',
    onObserveStart: () => {

      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 0.5)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 3)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_FILL, 'fill-opacity', 0)
      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 0)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)

      MAP.easeTo({
        essential: true,
        center: source.center,
        pitch: 10,
        zoom: source.zoom * 0.9,
      })
    },
    onResize: () => {

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)

      MAP.easeTo({
        essential: true,
        pitch: 10,
        center: source.center,
        zoom: source.zoom * 0.9,
      })
    },
  }),
  new Section({
    id: '01_section',
    onObserveStart: () => {
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 6)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_FILL, 'fill-opacity', [
        'match',
        ['get', 'id'],
        '65',
        0.5,
        /* others */ 0,
      ])

      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-opacity', 0)
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-stroke-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', 0)
      MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 0)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)
      MAP.easeTo({
        essential: true,
        pitch: 20,
        center: source.center,
        zoom: source.zoom,
        speed: 0.5,
      })
    },
    onResize: () => {

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)
      MAP.easeTo({
        essential: true,
        center: source.center,
        zoom: source.zoom,
        speed: 0.5,
      })
    },
    onObserveEnd: () => {
      //
    },
  }),
  new Section({
    id: '02_section',
    onObserveStart: () => {
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 0.5)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 3)

      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-opacity', 0)
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-stroke-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', [
        'match',
        ['get', 'id'],
        '65',
        1,
        /* others */ 0,
      ])
      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-width', [
        'match',
        ['get', 'id'],
        '65',
        4,
        /* others */ 1,
      ])
      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_FILL, 'fill-opacity', [
        'match',
        ['get', 'id'],
        '65',
        0.2,
        /* others */ 0,
      ])

      MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 0)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_PROVINCES)
      MAP.easeTo({
        essential: true,
        pitch: 20,
        center: source.center,
        zoom: source.zoom,
        speed: 0.5,
      })
    },
    onResize: () => {

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_PROVINCES)
      MAP.easeTo({
        essential: true,
        pitch: 20,
        center: source.center,
        zoom: source.zoom,
        speed: 0.5,
      })
    },
    onObserveEnd: () => {
      //
    },
  }),
  new Section({
    id: '03_section',
    onObserveStart: () => {
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 0.5)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 3)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_FILL, 'fill-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-opacity', 0)
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-stroke-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE_LINE, 'line-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-width', [
        'match',
        ['get', 'id'],
        '65',
        4,
        /* others */ 0,
      ])

      MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 1)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_ROUTE)
      const featureStart = source.data.features.find(f => f.id === 'start')

      MAP.easeTo({
        essential: true,
        pitch: 25,
        bearing: 0,
        center: featureStart.geometry.coordinates,
        zoom: 4.9,
        // speed: 0.5,
      })
    },
    onResize: () => {
      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_PROVINCES)
      MAP.easeTo({
        essential: true,
        pitch: 25,
        bearing: 0,
        center: source.center,
        zoom: 4.9,
        // speed: 0.5,
      })
    },
  }),
  new Section({
    id: '04_section',
    animated: true,
    onObserveStart: (section) => {

      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 1)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_FILL, 'fill-opacity', 0)
      MAP.setPaintProperty(LAYER_ID.CHINA_FACTORIES_POINTS, 'circle-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', [
        'match',
        ['get', 'id'],
        '65',
        1,
        /* others */ 0,
      ])

      // show start and end points
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-stroke-opacity', 1)

      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE_LINE, 'line-opacity', 1)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_ROUTE)
      const featureRoute = source.data.features.find(f => f.id === 'route')

      const fromStart = section.percent < 50

      section.source = source
      section.sourceroute = featureRoute
      section.currentPercent = fromStart ? 0 : 100

      section.currentCameraPosition = MAP.getCenter()
      section.currentZoom = MAP.getZoom()
      section.startZoom = 4.9
      section.endZoom = 4

      MAP.setPitch(25)
      MAP.easeTo({
        essential: true,
        zoom: section.startZoom,
        speed: 0.5,
      })
    },
    onDraw(section) {
      //
      const percent = lerp(section.currentPercent, section.percent, 0.1)
      section.currentPercent = percent
      const animationPhase = percent / 100

      // calculate the distance along the path based on the animationPhase
      const alongPath = along(section.sourceroute, (section.sourceroute.distance / 1000) * animationPhase)
          .geometry
          .coordinates

      section.currentZoom = section.startZoom + (section.endZoom - section.startZoom) * animationPhase

      const lngLat = {
        lng: alongPath[0],
        lat: alongPath[1],
      }

      // console.log(lngLat)

      if (section.currentCameraPosition) {
        const SMOOTH_FACTOR = 0.95
        lngLat.lng = lerp(lngLat.lng, section.currentCameraPosition.lng, SMOOTH_FACTOR)
        lngLat.lat = lerp(lngLat.lat, section.currentCameraPosition.lat, SMOOTH_FACTOR)
      }
      section.currentCameraPosition = lngLat

      MAP.easeTo({ center: lngLat, zoom: section.currentZoom })

      MAP.setPaintProperty(
          LAYER_ID.CHINA_ROUTE_LINE,
          'line-gradient',
          [
            'step',
            ['line-progress'],
            '#bb9a1d',
            animationPhase,
            'rgba(0, 0, 0, 0)',
          ],
      )

    },
    onObserveEnd: (section) => {
      MAP.setPaintProperty(
          LAYER_ID.CHINA_ROUTE_LINE,
          'line-gradient',
          [
            'step',
            ['line-progress'],
            '#bb9a1d',
            section.currentPercent > 50 ? 1 : 0,
            'rgba(0, 0, 0, 0)',
          ],
      )
    },
  }),
  new Section({
    id: '05_section',
    onObserveStart: () => {

      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 0.5)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 3)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_FILL, 'fill-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-width', [
        'match',
        ['get', 'id'],
        '65',
        4,
        /* others */ 0,
      ])

      MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-stroke-opacity', 1)

      MAP.setPaintProperty(
          LAYER_ID.CHINA_ROUTE_LINE,
          'line-gradient',
          [
            'step',
            ['line-progress'],
            '#bb9a1d',
            1,
            'rgba(0, 0, 0, 0)',
          ],
      )

      MAP.setPaintProperty(LAYER_ID.CHINA_FACTORIES_POINTS, 'circle-opacity', 1)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_ROUTE)
      const featureEnd = source.data.features.find(f => f.id === 'end')
      MAP.easeTo({
        essential: true,
        pitch: 25,
        bearing: 0,
        center: featureEnd.geometry.coordinates,
        zoom: 4,
        speed: 0.5,
      })
    },
  }),
  new Section({
    id: '06_section',
    onObserveStart: () => {
      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)
      MAP.easeTo({
        essential: true,
        pitch: 20,
        center: source.center,
        zoom: source.zoom,
        speed: 0.5,
      })
    },
    onResize: () => {
      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)
      MAP.easeTo({
        essential: true,
        center: source.center,
        zoom: source.zoom,
        speed: 0.5,
      })
    }
   }),
  new Section({
    id: '07_section',
  }),
]