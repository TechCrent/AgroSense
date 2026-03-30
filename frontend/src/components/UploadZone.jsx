import { useDropzone } from 'react-dropzone'
import { useCallback, useState, useEffect } from 'react'
import { ImagePlus, Camera } from 'lucide-react'
import CameraModal from './CameraModal.jsx'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function processFile(file, { setError, setImageFile, setImagePreview, t }) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    setError(t.error_file_type)
    return
  }
  if (file.size > MAX_SIZE) {
    setError(t.error_file_size)
    return
  }
  setError(null)
  setImageFile(file)
  setImagePreview(URL.createObjectURL(file))
}

export default function UploadZone({ t, imageFile, imagePreview, setImageFile, setImagePreview, setError }) {
  const [cameraOpen, setCameraOpen] = useState(false)
  const [dropped, setDropped] = useState(false)

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const isTooBig = rejectedFiles[0].errors.some((e) => e.code === 'file-too-large')
      setError(isTooBig ? t.error_file_size : t.error_file_type)
      return
    }
    const file = acceptedFiles[0]
    if (file) {
      setDropped(true)
      processFile(file, { setError, setImageFile, setImagePreview, t })
    }
  }, [t, setError, setImageFile, setImagePreview])

  useEffect(() => {
    if (!dropped) return
    const id = setTimeout(() => setDropped(false), 300)
    return () => clearTimeout(id)
  }, [dropped])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: MAX_SIZE,
    multiple: false,
  })

  function handleCameraCapture(file) {
    setCameraOpen(false)
    processFile(file, { setError, setImageFile, setImagePreview, t })
  }

  function handleRemove(e) {
    e.stopPropagation()
    setImageFile(null)
    setImagePreview(null)
  }

  return (
    <>
      {cameraOpen && (
        <CameraModal
          t={t}
          onCapture={handleCameraCapture}
          onClose={() => setCameraOpen(false)}
        />
      )}

      <div>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer
            transition-all duration-200 active:scale-[0.99]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ag-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141c19]
            ${dropped || isDragActive
              ? 'border-ag-green-700 bg-ag-green-50'
              : imageFile
                ? 'border-ag-green-300 bg-ag-green-50 dark:bg-[#1a2e24]'
                : 'border-ag-green-300 bg-ag-surface shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:border-ag-green-500 hover:bg-ag-green-50 dark:hover:bg-[#1a2e24] dark:border-[#3d8f6c]'
            }
          `}
        >
          <input {...getInputProps()} />

          {imageFile ? (
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src={imagePreview}
                alt={t.image_preview_alt}
                className="w-full h-52 object-cover rounded-2xl"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white text-sm flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors active:scale-[0.97]"
                aria-label={t.remove_image_aria}
              >
                ×
              </button>
              <p className="text-sm text-ag-text-2 mt-3 truncate max-w-xs mx-auto">
                {imageFile.name}
              </p>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 bg-ag-green-50 dark:bg-[#1a2e24] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ImagePlus size={32} color="#2D6A4F" strokeWidth={1.75} />
              </div>
              <p className="font-semibold text-ag-text-1 text-base">{t.upload_title}</p>
              <p className="text-sm text-ag-text-3 mt-1 leading-relaxed">{t.upload_subtitle}</p>
            </div>
          )}
        </div>

        <div className="mt-3 text-center">
          <p className="text-sm text-ag-text-3">{t.upload_or}</p>
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="w-full mt-3 py-3 rounded-2xl border border-ag-border bg-ag-surface text-ag-text-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-ag-bg hover:border-ag-green-300 transition-all duration-200 active:scale-[0.98] dark:bg-[#141c19] dark:border-[#2a3d34] dark:hover:border-ag-green-500/50"
          >
            <Camera size={16} color="#4A5E54" strokeWidth={2} />
            {t.take_photo}
          </button>
        </div>
      </div>
    </>
  )
}
