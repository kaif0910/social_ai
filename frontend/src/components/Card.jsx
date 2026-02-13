export default function Card({ title, children, className = '', hover = false }) {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-xl p-6 ${
      hover ? 'hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/50 transition-all duration-200' : ''
    } ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
