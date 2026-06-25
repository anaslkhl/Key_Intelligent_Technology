export default function PageHeader({ 
  icon, 
  title, 
  description, 
  actions,
  eyebrow 
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-[#111111] sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            {icon}
          </div>
        )}
        <div>
          {eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {eyebrow}
            </p>
          )}
          <h1 
            className="font-bold text-slate-900 dark:text-white" 
            style={{ fontSize: 'clamp(21px, 2vw, 35px)' }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}