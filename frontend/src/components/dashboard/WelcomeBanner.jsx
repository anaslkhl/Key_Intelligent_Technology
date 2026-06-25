import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Rocket, Package, BookOpen, Ticket } from 'lucide-react';

const STORAGE_KEY = 'kit_welcome_dismissed';

export default function WelcomeBanner() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    setIsDismissed(dismissed);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleAction = (path) => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    navigate(path);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-6 shadow-md dark:border-blue-900/30 dark:from-blue-950/40 dark:to-[#0a1628] dark:shadow-blue-900/20">
      {/* Decorative elements */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-200/30 dark:bg-blue-500/10" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-blue-200/20 dark:bg-blue-500/5" />

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        aria-label="Dismiss welcome banner"
      >
        <X size={18} />
      </button>

      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        {/* Icon */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:bg-blue-500">
          <Rocket size={28} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            👋 Welcome to KIT Support Hub!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Here's how to get started with the platform:
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleAction('/robots/register')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 hover:scale-[1.02]"
            >
              <Package size={16} />
              Register Robot
            </button>
            <button
              onClick={() => handleAction('/knowledge-base')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:scale-[1.02] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <BookOpen size={16} />
              Browse KB
            </button>
            <button
              onClick={() => handleAction('/tickets/create')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:scale-[1.02] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Ticket size={16} />
              Create Ticket
            </button>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}