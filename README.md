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
