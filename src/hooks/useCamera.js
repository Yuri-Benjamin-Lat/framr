import { useRef, useState, useCallback } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [facingMode, setFacingMode] = useState('user')

  const start = useCallback(async (facing) => {
    const mode = facing ?? 'user'
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setReady(true)
        }
      }
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setReady(false)
  }, [])

  const capture = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [facingMode])

  const flipCamera = useCallback(() => {
    const next = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(next)
    start(next)
  }, [facingMode, start])

  return { videoRef, ready, error, facingMode, start, stop, capture, flipCamera }
}