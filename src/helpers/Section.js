// Section.js
import { ANIMATION_FRAME_RATE, DEBUG, videoURLAppend } from '@src/MapConfig.js'

class SectionPlayer {
  constructor(id, player, section) {
    this.loaded = false
    this.id = id
    this.player = player
    this.section = section

    this.player.on('loaded', () => {
      if (DEBUG) console.log('Iframe video', this.id, 'loaded')
      // mark as loaded
      this.loaded = true
      // seek video to first second
      player.setCurrentTime(1)
      // now that this video is loaded, lets play only the video that we see, pause all others
      if (this.section.entered && this.id === this.section.curentVideoId) {
        this.play()
      } else {
        this.pause()
      }
    })

    this.playTimeout = 0
  }

  play() {
    this.playTimeout = setTimeout(() => {
      if (DEBUG) console.log('Iframe video', this.id, 'play')
      this.player.play()
    }, 250)
  }

  pause() {
    clearTimeout(this.playTimeout)
    if (DEBUG) console.log('Iframe video', this.id, 'pause')
    this.player.pause()
  }

}

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
    this.onObserveStart = options.onObserveStart || function () {
    }
    this.onObserveEnd = options.onObserveEnd || function () {
    }
    this.onDraw = options.onDraw || function () {
    }
    this.onMapLoaded = options.onMapLoaded || function () {
    }
    this.onResize = options.onResize || function () {
    }

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

    this.videoPlayers = {}
    this.curentVideoId = null
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
    const b = this.element.getBoundingClientRect()
    this.bbox = {
      height: b.height,
      top: b.top + window.scrollY,
    }
  }

  onIFrameObserved(iframe) {
    // handle only iframes that are marked with "vimeo" for now
    if (iframe.dataset.type === 'vimeo') {

      // pause previous video
      if (this.curentVideoId) {
        // pause current video
        const oldPlayer = this.videoPlayers[this.curentVideoId]
        if (oldPlayer.loaded) {
          oldPlayer.pause()
        }
      }

      // play new video and set currentId
      this.curentVideoId = iframe.dataset.id
      const player = this.videoPlayers[this.curentVideoId]
      if (player.loaded) {
        player.play()
      }
      if (DEBUG) console.log('Iframe vimeo video', this.curentVideoId, 'appeared in section:', this.id)
    }
  }

  observeIframes(iframes) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.onIFrameObserved(entry.target)
        }
      })
    }, { threshold: 0.4 }) // Adjust as needed

    iframes.forEach(iframe => {
      // setup observe
      observer.observe(iframe)

      if (iframe.dataset.type === 'vimeo') {

        // if vimeo iframe, setup video player
        const videoId = iframe.dataset.id
        const videoURL = iframe.dataset.src

        // set the iframe src on map load (with autoplay)
        iframe.setAttribute('src', videoURL + videoURLAppend)
        iframe.removeAttribute('data-src')

        // since vimeo.js is added in index.html lets create a player instance provided by them
        const player = new Vimeo.Player(iframe)

        if (DEBUG) console.log('Iframe vimeo video:', videoId, 'created in section:', this.id)

        // add it to section players under id
        this.videoPlayers[videoId] = new SectionPlayer(videoId, player, this)
      }
    })
  }

  stopVideos() {
    Object.keys(this.videoPlayers).forEach(key => {
      const sectionPlayer = this.videoPlayers[key]
      if (sectionPlayer) {
        sectionPlayer.pause()
      }
    })
  }

  // Additional methods for data manipulation could be added here
}

export default Section
