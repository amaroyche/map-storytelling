import { DATA_SOURCES } from '@src/MapConfig.js'

export function LoadAllData(callback) {
  Promise.all(DATA_SOURCES.map(source => fetchData(source)))
      .then(callback)
      .catch(error => console.error('Error loading data:', error))
}

export function AddDataSourcesToMap() {
  DATA_SOURCES.forEach(source => source.loaded())
}

function fetchData(source) {
  return fetch(source.url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return source.type === 'txt' ? response.text() : response.json()
      })
      .then(data => {
        source.data = data
      })
}
