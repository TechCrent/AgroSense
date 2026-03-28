import { useRef, useEffect, useState } from 'react'

export default function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        setError('Camera access denied. Please allow camera permissions and try again.')
      }
    }
    startCamera()

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function handleVideoReady() {
    setReady(true)
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  function handleCapture() {
    if (!videoRef.current || !ready) return

    // Flash effect
    setFlash(true)
    setTimeout(() => setFlash(false), 150)

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
      stopStream()
      onCapture(file)
    }, 'image/jpeg', 0.92)
  }

  function handleClose() {
    stopStream()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button
          onClick={handleClose}
          className="text-white text-sm font-medium px-3 py-1 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <span className="text-white font-semibold text-sm">Take a Photo</span>
        {/* spacer to keep title centred */}
        <div className="w-16" />
      </div>

      {/* Camera feed */}
      <div className="flex-1 relative overflow-hidden">
        {/* White flash overlay */}
        {flash && <div className="absolute inset-0 bg-white z-10 pointer-events-none" />}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center gap-4">
            <span className="text-5xl">📷</span>
            <p className="text-white text-sm leading-relaxed">{error}</p>
            <button
              onClick={handleClose}
              className="mt-2 px-6 py-2 rounded-full bg-white text-black text-sm font-semibold"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={handleVideoReady}
              className="w-full h-full object-cover"
            />
            {/* Viewfinder corners */}
            {ready && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-64">
                  <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#52B788] rounded-tl-lg" />
                  <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#52B788] rounded-tr-lg" />
                  <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#52B788] rounded-bl-lg" />
                  <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#52B788] rounded-br-lg" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Shutter bar */}
      {!error && (
        <div className="bg-black/80 py-8 flex items-center justify-center">
          <button
            onClick={handleCapture}
            disabled={!ready}
            aria-label="Capture photo"
            className={`
              w-18 h-18 rounded-full border-4 border-white flex items-center justify-center
              transition-all active:scale-90
              ${ready ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}
            `}
            style={{ width: 72, height: 72 }}
          >
            <div className="w-14 h-14 rounded-full bg-white" />
          </button>
        </div>
      )}
    </div>
  )
}
