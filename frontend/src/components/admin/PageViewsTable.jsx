import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function PageViewsTable({ data, onPageChange }) {
  const rows = Array.isArray(data) ? data : data?.data ?? []
  const meta = Array.isArray(data) ? null : data?.meta
  const currentPage = meta?.current_page ?? 1
  const lastPage = meta?.last_page ?? 1
  const total = meta?.total ?? rows.length

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < lastPage

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Page Views</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Most viewed pages with real pagination.</p>
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {total} {total === 1 ? 'page' : 'pages'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <th className="px-5 py-3">Page</th>
              <th className="px-5 py-3">Views</th>
              <th className="px-5 py-3">Unique</th>
              <th className="px-5 py-3">Avg Time</th>
              <th className="px-5 py-3">Last Viewed</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  No page view data available yet. Data will appear once users start visiting pages.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.path} className={index < rows.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}>
                <td className="max-w-xs truncate px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{row.page_name ?? row.path}</td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{row.views}</td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{row.unique_visitors}</td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{row.avg_time_on_page} ms</td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{row.last_viewed ? new Date(row.last_viewed).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && lastPage > 1 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total ?? 0}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => canGoPrevious && onPageChange?.(currentPage - 1)}
              disabled={!canGoPrevious}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="min-w-16 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
              {currentPage} / {lastPage}
            </span>
            <button
              type="button"
              onClick={() => canGoNext && onPageChange?.(currentPage + 1)}
              disabled={!canGoNext}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Next page"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
