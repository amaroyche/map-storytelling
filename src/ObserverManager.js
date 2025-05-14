import Section from '@src/helpers/Section'
import { DATA_SOURCES, DEBUG, SECTIONS } from '@src/MapConfig'

export let active_section = null
export let previous_section = null
let inResize = false
let scroll_indicator = null

// debug setup
let ob_wrapper = null
let ob_section = null
let ob_section_x = null
let ob_section_height = null
let ob_section_percent = null
let ob_scroll_y = null
let ob_scroll_percent = null

const setActiveSection = (source) => {
  if (active_section !== source) {
    if (active_section) {
      active_section.observeEnd()
    }
    // set new source, could be null
    previous_section = active_section
    active_section = source
    if (active_section) {
      active_section.observeStart()
    }
  }
}

const debounceResizeEvent = (func, delay) => {
  let timeoutId
  return (...args) => {
    inResize = true
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      inResize = false
      func(...args)
    }, delay)
  }
}

const sortSectionsById = () => {
  SECTIONS.sort((a, b) => {
    if (a.id < b.id) return -1
    if (a.id > b.id) return 1
    return 0
  })
}

export const ObserverSetup = () => {
  return new Promise(resolve => {
    let sections = document.querySelectorAll('section')

    sections.forEach((sectionElement, sIdx) => {
      if (!sectionElement.id) {
        console.warn(`Section element does not have ID associated.`, sectionElement)
      }
      const section = SECTIONS.find(s => s.id === sectionElement.id)
      if (section) {
        // assign this sectionElement to section
        section.element = sectionElement
      } else {
        // creating section for sectionElement
        const staticSource = new Section({
          id: sIdx.toString().padStart(2, '0') + '_section',
          element: sectionElement,
        })
        SECTIONS.push(staticSource)

        if (DEBUG) console.log(`Creating static source for sectionElement ${staticSource.id}`)
      }
    })

    // must sort according to layout and ids (important for proper calculations)
    sortSectionsById()

    if (DEBUG) console.info(SECTIONS)

    SECTIONS.forEach(section => {
      const progress = section.element.querySelector('progress')
      if (progress) {
        if (DEBUG) console.info(`${section.id} contains progress element`)
        section.progressElement = progress
      }
      section.measure()
    })

    scroll_indicator = document.querySelector('#scroll_indicator')

    ob_wrapper = document.querySelector('#ob_wrapper')
    ob_scroll_y = document.querySelector('#ob_scroll_y')
    ob_scroll_percent = document.querySelector('#ob_scroll_percent')
    ob_section = document.querySelector('#ob_section')
    ob_section_height = document.querySelector('#ob_section_height')
    ob_section_x = document.querySelector('#ob_section_x')
    ob_section_percent = document.querySelector('#ob_section_percent')

    // notify that map is loaded at this point
    SECTIONS.forEach(section => {
      section.mapLoaded()
    })

    if (DEBUG) {
      ob_wrapper.style.display = 'block'
    }

    ObserverOnScroll()

    resolve()
  })
}

export const ObserverOnScroll = () => {
  if (inResize) {
    // let's wait for resize to end
    return
  }
  const overallPercent = Math.round(window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100)

  scroll_indicator.classList.toggle('fade-out', window.scrollY > window.innerHeight / 4)

  // lets determine current active source
  let new_section = null
  const position_bottom = window.innerHeight + window.scrollY
  SECTIONS.forEach(section => {
    if (section.bbox) {
      if (position_bottom > (section.bbox.top + window.innerHeight * 0.5)) {
        new_section = section
      }
    }
  })

  setActiveSection(new_section)

  if (active_section) {
    active_section.onScroll()

    if (DEBUG) {
      ob_scroll_y.innerText = window.scrollY
      ob_scroll_percent.innerText = overallPercent
      ob_section.innerText = active_section.id
      ob_section_height.innerText = Math.round(active_section.bbox.height)
      ob_section_x.innerText = Math.floor(active_section.position)
      ob_section_percent.innerText = Math.round(active_section.percent)
    }
    return
  }


  if (DEBUG) {
    ob_scroll_y.innerText = window.scrollY
    ob_scroll_percent.innerText = overallPercent
    ob_section.innerText = ''
    ob_section_height.innerText = ''
    ob_section_x.innerText = ''
    ob_section_percent.innerText = ''
  }
}

export const ObserverOnResize = debounceResizeEvent(() => {
  if (DEBUG) console.log('resize')
  SECTIONS.forEach(s => s.measure())
  DATA_SOURCES.forEach(ds => {
    if (ds.hasOwnProperty('onResize')) ds.resized(ds)
  })
  active_section.resize()
  ObserverOnScroll()
}, 250)

