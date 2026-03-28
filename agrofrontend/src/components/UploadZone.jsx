import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function UploadZone({ t, imageFile, imagePreview, setImageFile, setImagePreview, setError }) {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      const isTooBig = rejection.errors.some((e) => e.code === 'file-too-large')
      setError(isTooBig ? t.error_file_size : t.error_file_type)
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

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
  }, [t, setError, setImageFile, setImagePreview])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: MAX_SIZE,
    multiple: false,
  })

  function handleCameraChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

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

  function handleRemove(e) {
    e.stopPropagation()
    setImageFile(null)
    setImagePreview(null)
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed border-[#52B788] rounded-2xl p-8 text-center cursor-pointer
          transition-colors
          ${imageFile ? 'bg-[#F0FFF4]' : isDragActive ? 'bg-[#F0FFF4]' : 'bg-white hover:bg-[#F0FFF4]'}
        `}
      >
        <input {...getInputProps()} />

        {imageFile ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="preview"
              className="max-h-48 rounded-xl object-cover mx-auto"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full hover:bg-red-200 transition-colors"
            >
              × Remove
            </button>
            <p className="text-sm text-[#555F61] mt-3 truncate max-w-xs mx-auto">
              {imageFile.name}
            </p>
          </div>
        ) : (
          <div>
            <div className="text-5xl mb-3">🌿</div>
            <p className="font-semibold text-[#2D6A4F]">{t.upload_title}</p>
            <p className="text-sm text-[#555F61] mt-1">{t.upload_subtitle}</p>
          </div>
        )}
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm text-[#555F61]">or</p>
        <label className="inline-flex items-center gap-2 mt-2 px-4 py-2 border border-[#52B788] text-[#2D6A4F] rounded-full text-sm font-medium cursor-pointer hover:bg-[#F0FFF4] transition-colors">
          📷 Take a photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCameraChange}
          />
        </label>
      </div>
    </div>
  )
}
