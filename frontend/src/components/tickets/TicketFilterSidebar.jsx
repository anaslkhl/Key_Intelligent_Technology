import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import TicketFilterItem from './TicketFilterItem'

export default function TicketFilterSidebar({
  filters,
  categoryId,
  familyId,
  totalCount = 0,
  onCategoryChange,
  onFamilyChange,
  onReset,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const categories = filters?.categories ?? []
  const families = filters?.families ?? []
  const hasActiveFilters = Boolean(categoryId || familyId)

  const closeMobile = () => setIsOpen(false)

  const content = (
    <aside className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-slate-50">Filters</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Narrow tickets by category and family.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onReset()
            closeMobile()
          }}
          disabled={!hasActiveFilters}
          className="rounded-lg px-2.5 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent dark:text-blue-300 dark:hover:bg-blue-950/40 dark:disabled:text-slate-700"
        >
          Reset
        </button>
      </div>

      <div className="mt-5">
        <TicketFilterItem
          label="All tickets"
          count={totalCount}
          isActive={!hasActiveFilters}
          onClick={() => {
            onReset()
            closeMobile()
          }}
        />
      </div>

      <FilterGroup title="Product Families" emptyLabel="No families yet">
        {families.map((family) => (
          <TicketFilterItem
            key={family.id}
            label={family.name}
            count={family.count}
            isActive={familyId === family.id}
            onClick={() => {
              onFamilyChange(familyId === family.id ? '' : family.id)
              closeMobile()
            }}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Categories" emptyLabel="No categories yet">
        {categories.map((category) => (
          <TicketFilterItem
            key={category.id}
            label={category.name}
            count={category.count}
            isActive={categoryId === category.id}
            onClick={() => {
              onCategoryChange(categoryId === category.id ? '' : category.id)
              closeMobile()
            }}
          />
        ))}
      </FilterGroup>
    </aside>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:w-auto lg:hidden"
      >
        <SlidersHorizontal size={16} />
        Filters
      </button>

      <div className="hidden min-w-[240px] lg:block lg:w-full lg:shrink-0">{content}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-slate-950/40"
            onClick={closeMobile}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-slate-50 p-4 shadow-2xl dark:bg-slate-950">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Ticket filters</span>
              <button
                type="button"
                onClick={closeMobile}
                className="grid min-h-11 min-w-11 place-items-center rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  )
}

function FilterGroup({ title, emptyLabel, children }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children
  const isEmpty = Array.isArray(items) ? items.length === 0 : !items

  return (
    <div className="mt-6">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h3>
      <div className="grid gap-1.5">
        {isEmpty ? <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-400 dark:bg-slate-950 dark:text-slate-500">{emptyLabel}</p> : items}
      </div>
    </div>
  )
}
