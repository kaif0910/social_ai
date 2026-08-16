export default function Card({ title, children, className = '', hover = false }) {
  return (
    <div className={`bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl ${
      hover ? 'hover:border-zinc-700 hover:shadow-xl hover:shadow-black/60 transition-all duration-200' : ''
    } ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">{title}</h3>
      )}
      {children}
    </div>
  );
}
