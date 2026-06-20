import PageHeader from '../components/common/PageHeader'
import { EmptyState } from '../components/common/QueryState'

export default function PortalPage({ eyebrow, title, description }) {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900 sm:py-10">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <PageHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-6">
          <EmptyState title={`${title} is ready`} description="This protected workspace is ready for its feature implementation." />
        </div>
      </div>
    </section>
  )
}
