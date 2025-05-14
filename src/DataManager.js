import { DATA_SOURCES } from '@src/MapConfig.js'

export function LoadAllData() {
  return Promise.all(DATA_SOURCES.map(source => fetchData(source)))
      .catch(error => console.error('Error loading data:', error))
}

export function AddDataSourcesToMap() {
  return new Promise(resolve => {
    DATA_SOURCES.forEach(source => source.loaded())
    resolve()
  })
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
