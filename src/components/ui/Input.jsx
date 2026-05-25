export default function Input({ type = 'text', placeholder, value, onChange, className = '' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 rounded-md bg-zinc-700 text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500 ${className}`}
    />
  )
}
