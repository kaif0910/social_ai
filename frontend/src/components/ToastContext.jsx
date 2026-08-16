import { createContext, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const ToastContext = createContext({
  showToast: (message, type = 'info') => { },
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const queueRef = useRef([]);

  // Process queue
  const processQueue = () => {
    if (queueRef.current.length > 0 && toasts.length === 0) {
      const nextToast = queueRef.current.shift();
      setToasts([nextToast]);
    }
  };

  useEffect(() => {
    processQueue();
  }, [toasts.length]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };

    queueRef.current.push(newToast);
    processQueue();
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setToasts((prev) => {
        if (prev.length === 0) {
          processQueue();
          return [];
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toastElements = (
    <div className="fixed top-4 right-4 z-50 pointer-events-none flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {typeof document !== 'undefined' && createPortal(toastElements, document.body)}
    </ToastContext.Provider>
  );
}

function Toast({ message, type, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    success: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: '✅' },
    error: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: '❌' },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: '⚠️' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'ℹ️' },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`
        pointer-events-auto w-80 max-w-[90vw] rounded-xl border p-4 shadow-2xl
        bg-slate-900/95 backdrop-blur-xl
        ${config.bg} ${config.border} ${config.text}
        transform transition-all duration-300 ease-out
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-xl mt-0.5">{config.icon}</div>
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-white/10"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default ToastContext;
