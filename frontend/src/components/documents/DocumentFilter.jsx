import { Search, SlidersHorizontal } from 'lucide-react'
import { documentTypes } from '../../api/documents'

const controlClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-zinc-700 dark:bg-[#111111] dark:text-white'

export default function DocumentFilter({ draftSearch, filters, categories = [], products = [], onSearchChange, onSearch, onFilterChange }) {
  return (
    <form onSubmit={onSearch} className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#111111]">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-zinc-200"><SlidersHorizontal size={17} />Filter library</div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_200px_220px_180px_auto]">
        <label className="relative block"><span className="sr-only">Search documents</span><Search size={18} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" /><input value={draftSearch} onChange={(event) => onSearchChange(event.target.value)} className={`${controlClass} pl-10`} placeholder="Search titles and descriptions" /></label>
        <label><span className="sr-only">Category</span><select value={filters.category_id} onChange={(event) => onFilterChange('category_id', event.target.value)} className={controlClass}><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label><span className="sr-only">Product</span><select value={filters.product_id} onChange={(event) => onFilterChange('product_id', event.target.value)} className={controlClass}><option value="">All products</option>{products.map((product) => <option key={product.id} value={product.id}>{product.model} · {product.name}</option>)}</select></label>
        <label><span className="sr-only">Document type</span><select value={filters.document_type} onChange={(event) => onFilterChange('document_type', event.target.value)} className={`${controlClass} capitalize`}><option value="">All types</option>{documentTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <button type="submit" className="button button-primary"><Search size={17} />Search</button>
      </div>
    </form>
  )
}
