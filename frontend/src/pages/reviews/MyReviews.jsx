import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate } from '../../utils/formatters'

export default function MyReviews() {
  const [page, setPage] = useState(1)
  const query = useQuery({ queryKey: ['my-reviews', page], queryFn: () => apiClient.get('/reviews/my', { params: { page, per_page: 9 } }).then((response) => response.data) })
  const reviews = query.data?.data || []

  return (
    <Page>
      <PageHeader eyebrow="Product feedback" title="Your reviews" description="Track feedback submitted for your KIT Robotics systems." actions={<Link to="/reviews/write" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Write review</Link>} />
      <div className="mt-6">
        {query.isLoading && <LoadingState label="Loading reviews..." />}
        {query.isError && <ErrorState message="Unable to load your reviews." onRetry={query.refetch} />}
        {query.isSuccess && reviews.length === 0 && <EmptyState title="No reviews yet" description="Share your experience with a robot registered to your account." action={<Link to="/reviews/write" className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Write review</Link>} />}
        {reviews.length > 0 && <><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div><div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white"><Pagination meta={query.data.meta} onPageChange={setPage} /></div></>}
      </div>
    </Page>
  )
}

function ReviewCard({ review }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-blue-600">{review.robot?.product?.model || 'KIT robot'}</p><h2 className="mt-2 !text-lg !font-semibold !text-slate-900">{review.title || review.robot?.name || 'Product review'}</h2></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${review.is_approved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{review.is_approved ? 'Approved' : 'Pending'}</span></div><div className="mt-3 text-lg text-amber-400" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}<span className="text-slate-200">{'★'.repeat(5 - review.rating)}</span></div>{review.comment && <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{review.comment}</p>}<p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">Submitted {formatDate(review.created_at)}</p></article>
}

function Page({ children }) { return <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
