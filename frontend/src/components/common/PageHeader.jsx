import { ReactNode } from 'react';

export default function PageHeader({ 
  icon, 
  title, 
  description, 
  actions,
  eyebrow 
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#111111]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm dark:from-blue-950/30 dark:to-blue-950/10 dark:text-blue-400">
              {icon}
            </div>
          )}
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {eyebrow}
              </p>
            )}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}