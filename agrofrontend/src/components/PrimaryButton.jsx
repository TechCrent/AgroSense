export default function PrimaryButton({
  label,
  icon,
  onClick,
  disabled,
  loading = false,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full py-4 rounded-2xl font-semibold text-base
        transition-all duration-200 flex items-center
        justify-center gap-2 min-h-[52px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ag-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141c19]
        active:scale-[0.97] duration-100
        ${disabled || loading
          ? 'bg-[#D8E8DF] dark:bg-[#3d4f47] text-ag-text-3 dark:text-[#7a8a84] cursor-not-allowed shadow-none'
          : 'bg-gradient-to-r from-[#2D6A4F] to-[#3A8C66] text-white shadow-[0_4px_12px_rgba(45,106,79,0.35)] hover:shadow-[0_6px_20px_rgba(45,106,79,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm'
        }
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex items-center justify-center">{icon}</span>
      ) : null}
      <span>{label}</span>
    </button>
  )
}
