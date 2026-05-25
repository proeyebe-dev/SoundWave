export default function Button({ children, onClick, type = 'button', className = '', disabled = false, loading = false, variant = 'primary', fullWidth = false, size = 'md', leftIcon = null }) {
  const base = 'flex items-center justify-center gap-2 font-semibold rounded-full transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-green-500 text-black hover:bg-green-400',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : leftIcon}
      {children}
    </button>
  )
}
