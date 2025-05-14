import mapboxgl from 'mapbox-gl'
import { DEBUG, TOKEN, USE_SW, CreateLayers } from '@src/MapConfig'
import { InitializeMap,  } from '@src/MapManger'
import { LoadAllData, AddDataSourcesToMap } from '@src/DataManager'
import {ObserverSetup, ObserverOnResize, ObserverOnScroll } from '@src/ObserverManager'

if (USE_SW) {
  // Service Worker registration (lets cache the mapbox tiles at least for local dev)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
  }
}

// setup token
mapboxgl.accessToken = TOKEN

// on dom loaded
document.addEventListener('DOMContentLoaded', () => {
  // load all data
  LoadAllData(() => {
    if (DEBUG) console.log('All data loaded')

    // Initialize the map
    InitializeMap( () => {
      if (DEBUG) console.log('Map initialized')

      AddDataSourcesToMap()
      CreateLayers()
      // setup sections
      ObserverSetup(() => {
        if (DEBUG) console.log('ObserverManager initialized')

        window.addEventListener('scroll', ObserverOnScroll)
        window.addEventListener('resize', ObserverOnResize)
      })

    })
  })
})

