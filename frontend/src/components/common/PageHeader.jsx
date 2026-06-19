export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase text-blue-600">{eyebrow}</p>}
        <h1 className="!text-3xl !font-bold text-slate-900 sm:!text-[32px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </div>
  )
}
