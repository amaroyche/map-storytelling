// Section.js
import { ANIMATION_FRAME_RATE } from '@src/MapConfig.js'

class Section {
  constructor(options = {}) {
    this.id = options.id
    this.type = options.type
    this.url = options.url
    this.type = options.type
    this.data = options.data || null
    this.element = options.element || null
    this.bbox = null
    this.progressElement = null
    this.onObserveStart = options.onObserveStart || function () {}
    this.onObserveEnd = options.onObserveEnd || function () {}
    this.onDraw = options.onDraw || function () {}
    this.onMapLoaded = options.onMapLoaded || function () {}
    this.onResize = options.onResize || function () {}

    this.position = options.position || 0
    this.percent = options.percent || 0

    // anim controls
    this.entered = false
    this.onEnterTimer = 0
    this.timeElapsed = 0
    this.timeNow = 0
    this.timeThen = 0
    this.fpsInterval = 1000 / ANIMATION_FRAME_RATE

    this.animated = !!options.animated ? options.animated : !!options.onDraw
    this.stop = true
  }

  mapLoaded() {
    this.onMapLoaded(this)
  }

  onScroll() {
    this.position = window.scrollY - this.bbox.top + (window.innerHeight * 0.5)
    this.percent = this.position / this.bbox.height * 100
  }

  resize() {
    this.onResize(this)
  }

  startAnimation() {
    this.stop = false
    this.timeThen = window.performance.now()

    if (this.progressElement) {
      this.progressElement.classList.toggle('fade-in', true)
    }

    this.animate(this.timeThen)
  }
  stopAnimation() {
    this.stop = true
    if (this.progressElement) {
      this.progressElement.classList.remove('fade-in')
    }
  }

  animate() {
    // stop
    if (this.stop) {
      return
    }

    // calc elapsed time since last loop
    this.timeElapsed = this.timeNow - this.timeThen

    // if enough time has elapsed, draw the next frame
    if (this.timeElapsed > this.fpsInterval) {
      // Get ready for next frame by setting then=now, but...
      this.timeThen = this.timeNow - (this.timeElapsed % this.fpsInterval)
      // call onDraw
      this.onDraw(this, this.timeNow)
    }

    if (this.progressElement) {
      this.progressElement.value = this.percent
    }

    // request another frame
    requestAnimationFrame(() => {
      this.timeNow = window.performance.now()
      this.animate()
    })
  }

  observeStart() {
    this.onEnterTimer = setTimeout(() => {
      this.entered = true
      this.onObserveStart(this)

      if (this.animated) {
        this.startAnimation()
      }
    }, 150)
  }

  observeEnd() {
    clearTimeout(this.onEnterTimer)
    if (this.entered) {
      this.onObserveEnd(this)

      if (this.progressElement) {
        const v = parseInt(this.progressElement.value)
        this.progressElement.value = v >= 50 ? 100 : 0
      }

      if (this.animated) {
        this.stopAnimation()
      }
      this.entered = false
    }
  }

  measure() {
    const b =  this.element.getBoundingClientRect()
    this.bbox = {
      height: b.height,
      top: b.top+ window.scrollY,
    }
  }

  // Additional methods for data manipulation could be added here
}

export default Section
