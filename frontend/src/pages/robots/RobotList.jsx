import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate } from '../../utils/formatters'

export default function RobotList() {
  const query = useQuery({
    queryKey: ['robots'],
    queryFn: () => apiClient.get('/robots', { params: { per_page: 50 } }).then((response) => response.data),
  })
  const robots = query.data?.data || []

  return (
    <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Installed fleet"
          title="Your robots"
          description="View the systems registered to your KIT Support Hub account."
          actions={<Link to="/robots/register" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">Register robot</Link>}
        />

        <div className="mt-6">
          {query.isLoading && <LoadingState label="Loading robots..." />}
          {query.isError && <ErrorState message="Unable to load your robots." onRetry={query.refetch} />}
          {query.isSuccess && robots.length === 0 && (
            <EmptyState title="No robots registered" description="Register your first KIT Robotics system to create product-specific support requests." action={<Link to="/robots/register" className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Register robot</Link>} />
          )}
          {robots.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {robots.map((robot) => <RobotCard key={robot.id} robot={robot} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function RobotCard({ robot }) {
  const warrantyActive = robot.warranty_end && new Date(robot.warranty_end) >= new Date()

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-blue-600">{robot.product?.family?.name || 'KIT Robotics'}</p>
          <h2 className="mt-2 truncate !text-xl !font-semibold !text-slate-900">{robot.name || robot.product?.model || 'Registered robot'}</h2>
          <p className="mt-1 text-sm text-slate-500">{robot.product?.model} · {robot.product?.name}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${robot.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{robot.status}</span>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm">
        <div className="col-span-2"><dt className="text-xs uppercase text-slate-400">Serial number</dt><dd className="mt-1 break-all font-medium text-slate-700">{robot.serial_number}</dd></div>
        <div><dt className="text-xs uppercase text-slate-400">Purchased</dt><dd className="mt-1 font-medium text-slate-700">{formatDate(robot.purchase_date)}</dd></div>
        <div><dt className="text-xs uppercase text-slate-400">Warranty</dt><dd className={`mt-1 font-medium ${warrantyActive ? 'text-green-600' : 'text-slate-600'}`}>{robot.warranty_end ? formatDate(robot.warranty_end) : 'Not recorded'}</dd></div>
      </dl>
      <Link to="/tickets/create" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">Create support ticket</Link>
    </article>
  )
}
