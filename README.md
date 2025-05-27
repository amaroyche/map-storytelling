# Map Storytelling (Vanilla js + Mapbox)

## Installation
- Install [Node.js](https://nodejs.org/en/)
- Clone this repository
- install js dependencies: run `npm install` within project directory

**Development**

- Run `npm run dev` to start dev server
- Open http://localhost:3001/

**To Test production build locally**

- Run `npm run build` then `npm run preview` to build and preview app locally
- Open http://localhost:3000/

**Production**

- Run `npm run build` to build app
- Build will be located in `dist` folder

### Dev environment

- Using [Vite](https://vitejs.dev) pipeline as frontend build tool.
- Mapbox-GL for map rendering
- Turf.js for geospatial functions

Service Worker has been added temporary for caching mapbox tiles. (remove in production)


# Organisation of files and map setup a

Put all your geojson files in `public` folder. All map setup is done with `src/MapConfig.js`

Step 1: Map basic options 
```
export const TOKEN = 'YOUR-MAPBOX-TOKEN'

export const MAP_OPTIONS = {
  container: 'map',
  style: ...,
  center: [90.18741, 36.13885],
  zoom: 3,
  ...
}
```

Step 2: Create your map IDs for layers
```
const LAYER_ID = {
  LAYER_KEY: 'layer-key',
  ...
}
```

Step 3: Create your map IDs for sources
```
const SOURCE_ID = {
  SOURCE_KEY: 'source-key',
  ...
}
```

Step 4: Create data sources
```
export const DATA_SOURCES = [
  new Source({
    id: SOURCE_ID.SOURCE_KEY,
    type: 'json',
    url: '/path-to-file.geojson',
    onLoad: (source) => {
      source.addSourceToMap()
      source.measureDataBounds()
    },
    onResize: (source) => {
      source.measureDataBounds()
    },
  }),
  new Source({
    id: SOURCE_ID.SOURCE_KEY2,
    ...
  }),
]
```

Step 5: Create layers for the map (data sources will be loaded at this point)
```
export const CreateLayers = () => {
  MAP
      .addLayer({
        id: LAYER_ID.LAYER_KEY,
        type: 'line',
        source: SOURCE_ID.SOURCE_KEY,
        paint: {
          'line-color': '#8d000c',
          'line-width': 3,
          'line-opacity': 0,
        },
      })
      addLayer({
        ...
      })
      .addLayer({
        ...
      })
      .
}
```
Step 6: Create sections for the map
```
export const SECTIONS = [
  new Section({
    id: '00_section',
    onObserveStart: () => {
     
      // call map actions...
      MAP.flyTo({
        essential: true,
        pitch: 10,
        zoom: 10,
        speed: 0.9,
      })
      
    },
    onResize: () => { },
    onDraw: () => { },    
    onObserveEnd: () => { },
  }),
  new Section({
    id: '01_section',
    ...
  }),
}
```

Step 7: Modify index.html and add corresponding sections with ids
```
...
<section id='00_section'>

  <div class='section-container'>
    <div class='section-content'>
      <div class='content'>
        <!-- Your content for section -->
      </div>
    </div>
  </div>

</section>
...
```

**each section ID must begin with numeric characters that are used in sorting**

**and must correspond to section ID defined for section in `MapConfig.js`** 
```
  // OK  
  00_section
  01_route
  02_image
  ...
  
  // Not OK
  route_00
  section0
  ...
```


Section element with class `section-container` have modifiers for align and height

`<div class='section-container'>` is by default aligned to left or:

`<div class='section-container center'>` for center align of content

`<div class='section-container right'>` for right align of content

`<div class='section-container x2'>` for double the height (screen height) `x3, x4, x5` are also available 

For vertical align use element with class `section-container`

`<div class='section-content'>` is by default aligned to top or: 

`<div class='section-content v-center'>` for center align of content

`<div class='section-contentr v-bottom'>` for bottom align of content

