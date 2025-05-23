import Artplayer from 'artplayer'
import { useEffect, useRef, useState } from 'react'

import { webdavClient } from '@/pages/home'

type PlayerProps = {
  url: string
  index: number
  realIndex: number
  paused: boolean
  getInstance?: (art: Artplayer) => void
  [key: string]: unknown
}

Artplayer.PLAYBACK_RATE = [0.5, 1, 3, 5]

export default function Player({ url, index, realIndex, paused, getInstance, ...rest }: PlayerProps) {
  const artRef = useRef(null)
  const artCtrl = useRef<Artplayer | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (artRef.current) {
      artCtrl.current = new Artplayer({
        volume: 0.5,
        isLive: false,
        muted: false,
        autoplay: false,
        pip: true,
        // autoSize: true,
        autoMini: true,
        screenshot: true,
        setting: true,
        loop: true,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        subtitleOffset: true,
        miniProgressBar: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        airplay: true,
        // theme: '#23ade5',
        lang: navigator.language.toLowerCase(),
        url: '/webdav' + url,
        container: artRef.current
      })

      artCtrl.current.on('play', () => {})
      artCtrl.current.on('video:loadeddata', () => {})
      artCtrl.current.on('video:loadedmetadata', () => {
        setReady(true)
      })

      artCtrl.current.on('ready', () => {})

      if (getInstance && typeof getInstance === 'function') {
        getInstance(artCtrl.current)
      }
    }

    return () => {
      if (artCtrl.current && artCtrl.current.destroy) {
        artCtrl.current.destroy(false)
      }
    }
  }, [])

  useEffect(() => {
    console.log('index:', index, 'realIndex:', realIndex, 'url:', url)
    // console.log('ready:', ready)
    // console.log('paused:', paused)
    console.log('')

    if (artCtrl.current && ready && index === realIndex && !paused) {
      artCtrl.current.play()
    }

    if (artCtrl.current && ready && artCtrl.current.playing) {
      if (index !== realIndex) {
        artCtrl.current.pause()
      }
      if (paused) {
        artCtrl.current.pause()
      }
    }
  }, [index, realIndex, ready, paused])

  return <div ref={artRef} {...rest}></div>
}
