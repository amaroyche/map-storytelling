import Section from '@src/helpers/Section.js'
import Source from '@src/helpers/Source.js'
import { MAP } from '@src/MapManger.js'
import { along } from '@turf/turf'
import { lerp } from '@src/helpers/MapHelper.js'
import { SOURCE_BY_ID } from '@src/DataManager.js'
import { LngLatBounds } from 'mapbox-gl'

export const DEBUG = import.meta.env.DEV && false
export const ANIMATION_FRAME_RATE = 30

export const TOKEN = 'pk.eyJ1IjoidmlsbGV3aWxzb24iLCJhIjoiY21hMDhobDY0MHR2dzJrczg1Mjk4NmQyaCJ9.1ivMnqW2XTSfy2nf1utCBQ'

export const MAP_OPTIONS = {
  container: 'map',
  style: 'mapbox://styles/villewilson/cm8xrkm1x000z01qr35gb2fer',
  center: [90.18741, 36.13885],
  performanceMetricsCollection: false,
  respectPrefersReducedMotion: false,
  zoom: 3,
  antialias: true,
}

const LAYER_ID = {
  CHINA_BOUNDS: 'layer-china-bounds',
  CHINA_PROVINCES_BOUNDS: 'layer-china-provinces-bounds',
  CHINA_PROVINCES_FILL: 'layer-china-provinces-fill',
  // CHINA_XINJIANG_POINTS: 'layer-china-xinjiang-points',
  CHINA_FACTORIES_POINTS: 'china-factories-points',
  CHINA_ROUTE: 'layer-china-route',
  CHINA_ROUTE_LINE: 'layer-china-route-line',
  CHINA_BUILDINGS_BOUNDS: 'layer-china-buildings-bounds',
  CHINA_BUILDINGS_FILL: 'layer-china-buildings-fill',
}

const SOURCE_ID = {
  CHINA_BOUNDS: 'china-bounds',
  CHINA_PROVINCES: 'china-provinces',
  // CHINA_XINJIANG_POINTS: 'china-xinjiang-points',
  CHINA_FACTORIES_POINTS: 'china-factories-points',
  CHINA_ROUTE: 'china-route',
  CHINA_BUILDINGS: 'china-buildings',
}

const section3videoURL = 'https://player.vimeo.com/video/1086448399?h=dc6d2b2fa3&background=1&dnt=1&app_id=58479'

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
  // new Source({
  //   id: SOURCE_ID.CHINA_XINJIANG_POINTS,
  //   type: 'json',
  //   url: '/china-xinjiang-points.geojson',
  //   onLoad: (source) => {
  //     source.addSourceToMap()
  //     source.measureDataBounds()
  //   },
  //   onResize: (source) => {
  //     source.measureDataBounds()
  //   },
  // }),
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
  new Source({
    id: SOURCE_ID.CHINA_BUILDINGS,
    type: 'json',
    url: '/china-buildings-placeholder.geojson',
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
            'line-color': '#ffcb1b',
            'line-width': 1.5,
            'line-opacity': 0,
          },
        })
        .addLayer({
          id: LAYER_ID.CHINA_PROVINCES_BOUNDS,
          type: 'line',
          source: SOURCE_ID.CHINA_PROVINCES,
          paint: {
            'line-color': '#ffcb1b',
            'line-width': 1,
            'line-opacity': 0,
          },
        })
        .addLayer({
          id: LAYER_ID.CHINA_PROVINCES_FILL,
          type: 'fill',
          source: SOURCE_ID.CHINA_PROVINCES,
          paint: {
            'fill-color': '#ffcb1b',
            'fill-opacity': 0,
          },
        })
        // .addLayer({
        //   id: LAYER_ID.CHINA_XINJIANG_POINTS,
        //   type: 'circle',
        //   source: SOURCE_ID.CHINA_XINJIANG_POINTS,
        //   paint: {
        //     'circle-radius': 6,
        //     'circle-opacity': 0,
        //     'circle-color': '#ff0042',
        //   },
        // })
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
          'filter': ['==', ['get', 'visible'], 1],
        })
        // Here are the circles for start and end points of the route.
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
            'circle-color': '#ff001f',
          },
          'filter': ['==', '$type', 'Point'],
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
        .addLayer({
          id: LAYER_ID.CHINA_BUILDINGS_BOUNDS,
          type: 'line',
          source: SOURCE_ID.CHINA_BUILDINGS,
          paint: {
            'line-color': '#fffff8',
            'line-width': 3,
            'line-opacity': 1,
          },
        })
        .addLayer({
          id: LAYER_ID.CHINA_BUILDINGS_FILL,
          type: 'fill',
          source: SOURCE_ID.CHINA_BUILDINGS,
          paint: {
            'fill-color': 'rgba(89,21,21,0.55)',
            'fill-opacity': 1,
          },
        })
        .addLayer({
          id: LAYER_ID.CHINA_BUILDINGS_FILL + 'extrude',
          source: SOURCE_ID.CHINA_BUILDINGS,
          type: 'fill-extrusion',
          paint: {
            'fill-extrusion-color': 'rgba(127,153,169,0.55)',
            'fill-extrusion-height': 30,
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.85,
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

      // MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 0)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)

      MAP.easeTo({
        center: source.center,
        pitch: 10,
        zoom: source.zoom * 0.9,
        duration: 2000
      })
    },
    onResize: () => {

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)

      MAP.easeTo({
        pitch: 10,
        center: source.center,
        zoom: source.zoom * 0.9,
        duration: 2000
      })
    },
  }),
  new Section({
    id: '01_section',
    onObserveStart: () => {
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 1)

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
      // MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 0)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)
      MAP.easeTo({
        pitch: 20,
        center: source.center,
        zoom: source.zoom,
        duration: 2000
      })

    },
    onResize: () => {

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)
      MAP.easeTo({
        center: source.center,
        zoom: source.zoom,
        duration: 2000
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
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 1)

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

      // MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 0)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_PROVINCES)
      MAP.easeTo({
        pitch: 20,
        center: source.center,
        zoom: source.zoom,
        duration: 2000
      })
    },
    onResize: () => {

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_PROVINCES)
      MAP.easeTo({
        pitch: 20,
        center: source.center,
        zoom: source.zoom,
        duration: 2000
      })
    },
    onObserveEnd: () => {
      //
    },
  }),
  new Section({
    id: '03_section',
    onMapLoaded: (section) => {
      // set the iframe src on map load (with autoplay off)
      section.iframeElement.setAttribute('src', section3videoURL)
      // since vimeo.js is added in index.html lets create a player instance provided by them
      section.player = new Vimeo.Player(section.iframeElement)
      section.playerLoaded = false
      section.player.on('loaded', () => {
        section.playerLoaded = true
        // set it to first second to get image
        section.player.setCurrentTime(1)

        if (section.entered) {
          // we are on this section during map load event, play the video
          section.player.play()
        } else {
          // and let's pause the video on load
          section.player.pause()
        }
      })
    },
    onObserveStart: (section) => {
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 0.5)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 3)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_FILL, 'fill-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-stroke-opacity', 1)

      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE_LINE, 'line-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-width', [
        'match',
        ['get', 'id'],
        '65',
        4,
        /* others */ 0,
      ])

      // MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 1)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_ROUTE)
      const featureStart = source.data.features.find(f => f.id === 'start')

      MAP.easeTo({
        pitch: 25,
        bearing: 0,
        center: featureStart.geometry.coordinates,
        zoom: 5,
        duration: 2000
      })

      if (section.playerLoaded) {
        section.player.play()
      }
    },
    onResize: () => {
      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_PROVINCES)
      MAP.easeTo({
        pitch: 25,
        bearing: 0,
        center: source.center,
        zoom: 5,
        duration: 2000
      })
    },
    onObserveEnd: (section) => {
      // set player to pause again
      section.player.pause()
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

      // MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 0)
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
      const source2 = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)
      const featureRoute = source.data.features.find(f => f.id === 'route')
      const feature_start_to_center_Route = source.data.features.find(f => f.id === 'start_to_center')

      const fromStart = section.percent < 50

      section.source = source
      section.sourceroute = featureRoute
      section.cameraroute = feature_start_to_center_Route
      section.currentPercent = fromStart ? 0 : 100

      section.currentLngLat = MAP.getCenter()
      section.currentZoom = MAP.getZoom()
      section.startZoom = 5
      section.endZoom = source2.zoom

      // MAP.setPitch(25)
      MAP.easeTo({
        pitch: 25,
        zoom: section.startZoom,
      })
    },
    onDraw(section) {
      const percent = lerp(section.currentPercent, section.percent, 0.1)

      section.currentPercent = percent
      const animationPhase = percent / 100

      // calculate the distance along the path based on the animationPhase
      // const alongPath = along(section.sourceroute, (section.sourceroute.distance / 1000) * animationPhase)
      //     .geometry
      //     .coordinates

      // calculate the distance from start to the center of china based on changes
      const alongPathCamera = along(section.cameraroute, (section.cameraroute.distance / 1000) * animationPhase)
          .geometry
          .coordinates

      const lngLat = {
        lng: alongPathCamera[0],
        lat: alongPathCamera[1],
      }
      // console.log(lngLat)

      if (section.currentLngLat) {
        lngLat.lng = lerp(lngLat.lng, section.currentLngLat.lng, 0.85)
        lngLat.lat = lerp(lngLat.lat, section.currentLngLat.lat, 0.85)
      }
      section.currentLngLat = lngLat

      const z = section.startZoom + (section.endZoom - section.startZoom) * animationPhase

      section.currentZoom = lerp(z, MAP.getZoom(), 0.8)

      MAP.easeTo({ center: lngLat, zoom: section.currentZoom})

      MAP.setPaintProperty(
          LAYER_ID.CHINA_ROUTE_LINE,
          'line-gradient',
          [
            'step',
            ['line-progress'],
            '#ff0042',
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
            '#ff0042',
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

      MAP.setPaintProperty(LAYER_ID.CHINA_FACTORIES_POINTS, 'circle-opacity', 1)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-width', [
        'match',
        ['get', 'id'],
        '65',
        4,
        /* others */ 0,
      ])

      // MAP.setPaintProperty(LAYER_ID.CHINA_XINJIANG_POINTS, 'circle-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-stroke-opacity', 1)

      MAP.setPaintProperty(
          LAYER_ID.CHINA_ROUTE_LINE,
          'line-gradient',
          [
            'step',
            ['line-progress'],
            'rgba(0, 0, 0, 0)',
            1,
            'rgba(0, 0, 0, 0)',
          ],
      )

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)
      MAP.easeTo({
        pitch: 25,
        center: source.center,
        zoom: source.zoom,
        duration: 2000
      })
    },
  }),
  new Section({
    id: '06_section',
    onObserveStart: () => {
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 0.5)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 3)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_FILL, 'fill-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_FACTORIES_POINTS, 'circle-opacity', 1)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-width', [
        'match',
        ['get', 'id'],
        '65',
        4,
        /* others */ 0,
      ])

      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-opacity', 1)
      MAP.setPaintProperty(LAYER_ID.CHINA_ROUTE, 'circle-stroke-opacity', 1)

      MAP.setPaintProperty(
          LAYER_ID.CHINA_ROUTE_LINE,
          'line-gradient',
          [
            'step',
            ['line-progress'],
            'rgba(0, 0, 0, 0)',
            1,
            'rgba(0, 0, 0, 0)',
          ],
      )

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)

      MAP.easeTo({
        pitch: 25,
        center: source.center,
        zoom: source.zoom,
        duration: 2000
      })
    },
  }),
  new Section({
    id: '07_section',
    onObserveStart: () => {
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 0.5)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 1)

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

      MAP.setPaintProperty(LAYER_ID.CHINA_FACTORIES_POINTS, 'circle-opacity', 0)

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_PROVINCES)
      MAP.easeTo({
        pitch: 20,
        center: source.center,
        zoom: source.zoom,
        // speed: 1,
        duration: 2000
      })
    },
  }),
  new Section({
    id: '08_section',
    onObserveStart:() => {
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-opacity', 0.5)
      MAP.setPaintProperty(LAYER_ID.CHINA_BOUNDS, 'line-width', 3)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_FILL, 'fill-opacity', 0)
      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', 0)

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_FILL, 'fill-opacity', [
        'match',
        ['get', 'id'],
        '65',
        0.2,
        /* others */ 0,
      ])

      MAP.setPaintProperty(LAYER_ID.CHINA_PROVINCES_BOUNDS, 'line-opacity', [
        'match',
        ['get', 'id'],
        '65',
        1,
        /* others */ 0,
      ])

      const source = SOURCE_BY_ID(SOURCE_ID.CHINA_BOUNDS)

      MAP.easeTo({
        center: source.center,
        pitch: 10,
        zoom: source.zoom * 0.9,
        duration: 2000
      })
    }
  })
]