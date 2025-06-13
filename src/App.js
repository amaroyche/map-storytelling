import mapboxgl from 'mapbox-gl'
import { DEBUG, TOKEN, CreateLayers } from '@src/MapConfig'
import { InitializeMap,  } from '@src/MapManger'
import { LoadAllData, AddDataSourcesToMap } from '@src/DataManager'
import {ObserverSetup, ObserverOnResize, ObserverOnScroll } from '@src/ObserverManager'

// Service Worker registration (lets cache the mapbox tiles at least for local dev)
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
}

// setup token
mapboxgl.accessToken = TOKEN

async function InitApp() {

  await LoadAllData()
  if (DEBUG) console.log('All data loaded')

  await InitializeMap()
  if (DEBUG) console.log('Map initialized')

  await AddDataSourcesToMap()
  await CreateLayers()

  await ObserverSetup()
  if (DEBUG) console.log('ObserverManager initialized')

  window.addEventListener('scroll', ObserverOnScroll)
  window.addEventListener('resize', ObserverOnResize)
}

document.addEventListener('DOMContentLoaded', InitApp)