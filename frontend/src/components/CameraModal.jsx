import { useRef, useEffect, useState } from 'react'
import { Camera } from 'lucide-react'

export default function CameraModal({ t, onCapture, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const tRef = useRef(t)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(false)

  tRef.current = t

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

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
        setError(tRef.current.camera_error_denied)
      }
    }
    startCamera()

    return () => {
      streamRef.current?.getTracks().forEach((tr) => tr.stop())
    }
  }, [])

  function handleVideoReady() {
    setReady(true)
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
  }

  function handleCapture() {
    if (!videoRef.current || !ready) return

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
    <div
      className="fixed inset-0 z-50 flex w-full flex-col overflow-hidden bg-black"
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      <div className="flex shrink-0 items-center justify-between bg-black/90 px-4 py-2.5 backdrop-blur-sm">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-full border border-white/35 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          {t.camera_cancel}
        </button>
        <span className="text-sm font-semibold text-white">{t.camera_title}</span>
        <div className="w-16 shrink-0" aria-hidden />
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {flash && <div className="pointer-events-none absolute inset-0 z-20 bg-white" />}

        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
            <Camera size={48} color="#FFFFFF" strokeWidth={1.5} className="opacity-90" aria-hidden />
            <p className="text-sm leading-relaxed text-white">{error}</p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black"
            >
              {t.camera_go_back}
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
              className="h-full w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="pointer-events-auto flex flex-col items-center gap-3 px-4">
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={!ready}
                  aria-disabled={!ready}
                  className={`
                    group flex h-[5.25rem] w-[5.25rem] shrink-0 items-center justify-center rounded-full
                    border-[5px] border-white bg-transparent
                    shadow-[0_0_0_2px_rgba(82,183,136,0.45),0_8px_40px_rgba(0,0,0,0.55)]
                    transition-all active:scale-95
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] focus-visible:ring-offset-2 focus-visible:ring-offset-black/50
                    ${ready ? 'opacity-100' : 'cursor-not-allowed opacity-45'}
                  `}
                >
                  <span className="h-14 w-14 rounded-full bg-white shadow-inner ring-1 ring-white/80 transition-transform group-active:scale-95" />
                </button>
                <span className="max-w-[14rem] text-center text-xs font-semibold uppercase tracking-wide text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
                  {t.capture_photo_aria}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
