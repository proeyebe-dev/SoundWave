export default function Input({ type = 'text', placeholder, value, onChange, className = '', label = '', error = '', hint = '', required = false, autoFocus = false, rightIcon = null, onRightIconClick = null }) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-zinc-300">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoFocus={autoFocus}
          className={`w-full px-4 py-3 rounded-md bg-zinc-800 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-green-500 border border-zinc-700 ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
        />
        {rightIcon && (
          <button type="button" onClick={onRightIconClick} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
            {rightIcon}
          </button>
        )}
      </div>
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
