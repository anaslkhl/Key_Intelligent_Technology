import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { useAuth } from '../../contexts/auth'
import { formatDate } from '../../utils/formatters'

export default function ReviewList() {
  const { isAuthenticated, user } = useAuth()
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: ['reviews', page],
    queryFn: () => apiClient.get('/reviews', { params: { page, per_page: 9 } }).then((response) => response.data),
  })
  const reviews = query.data?.data || []

  return (
    <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Product feedback"
          title="Customer reviews"
          description="Read approved feedback from teams using KIT Robotics systems."
          actions={isAuthenticated && user?.role === 'client' ? <Link to="/reviews/write" className="button button-primary">Write a review</Link> : null}
        />
        <div className="mt-6">
          {query.isLoading && <LoadingState label="Loading reviews..." />}
          {query.isError && <ErrorState message="Unable to load reviews." onRetry={query.refetch} />}
          {query.isSuccess && reviews.length === 0 && <EmptyState title="No published reviews yet" description="Approved customer reviews will appear here." />}
          {reviews.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#111111]"><Pagination meta={query.data?.meta} onPageChange={setPage} /></div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function ReviewCard({ review }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#111111]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-blue-600">{review.robot?.product?.model || review.product?.model || 'KIT Robotics'}</p>
          <h2 className="mt-2 !text-lg !font-semibold text-slate-900 dark:text-white">{review.title || 'Product review'}</h2>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500"><Star size={16} fill="currentColor" />{review.rating}</span>
      </div>
      {review.comment && <p className="mt-4 line-clamp-5 text-sm leading-6 text-slate-600 dark:text-zinc-400">{review.comment}</p>}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-zinc-800">
        <span>{review.user?.name || 'Verified customer'}</span>
        <span>{formatDate(review.created_at)}</span>
      </div>
    </article>
  )
}
