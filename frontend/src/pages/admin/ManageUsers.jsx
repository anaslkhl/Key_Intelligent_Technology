import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate } from '../../utils/formatters'
import { AdminPage, inputClass } from './shared'

const roles = ['client', 'agent', 'admin']

export default function ManageUsers() {
  const client = useQueryClient(); const [page, setPage] = useState(1); const [role, setRole] = useState(''); const [draftSearch, setDraftSearch] = useState(''); const [search, setSearch] = useState('')
  const query = useQuery({ queryKey: ['admin-users', { page, role, search }], queryFn: () => apiClient.get('/admin/users', { params: { page, role: role || undefined, search: search || undefined, per_page: 15 } }).then((response) => response.data) })
  const update = useMutation({ mutationFn: ({ id, kind, value }) => apiClient.patch(`/admin/users/${id}/${kind}`, kind === 'role' ? { role: value } : { is_active: value }), onSuccess: () => { toast.success('User updated'); client.invalidateQueries({ queryKey: ['admin-users'] }); client.invalidateQueries({ queryKey: ['admin-stats'] }) }, onError: (error) => toast.error(error.response?.data?.message || 'Unable to update user') })
  const users = query.data?.data || []

  return <AdminPage><PageHeader eyebrow="Administration" title="User management" description="Manage account roles and access across the support hub." />
    <form onSubmit={(event) => { event.preventDefault(); setSearch(draftSearch.trim()); setPage(1) }} className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_220px_auto]"><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Search<input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} className={inputClass} placeholder="Name, email, or company" /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Role<select value={role} onChange={(event) => { setRole(event.target.value); setPage(1) }} className={inputClass}><option value="">All roles</option>{roles.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><button type="submit" className="button button-secondary self-end">Search</button></form>
    <div className="mt-5">{query.isLoading && <LoadingState label="Loading users..." />}{query.isError && <ErrorState message="Unable to load users." onRetry={query.refetch} />}{query.isSuccess && users.length === 0 && <EmptyState title="No users found" description="Try changing your search or role filter." />}{users.length > 0 && <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="divide-y divide-slate-200 lg:hidden">{users.map((user) => <UserCard key={user.id} user={user} update={update.mutate} />)}</div><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Tickets</th><th className="px-5 py-3">Robots</th><th className="px-5 py-3">Joined</th></tr></thead><tbody className="divide-y divide-slate-200">{users.map((user) => <tr key={user.id}><td className="px-5 py-4"><strong className="block text-slate-900">{user.name}</strong><span className="text-xs text-slate-500">{user.email}</span></td><td className="px-5 py-4"><RoleSelect user={user} update={update.mutate} /></td><td className="px-5 py-4"><StatusToggle user={user} update={update.mutate} /></td><td className="px-5 py-4 text-slate-600">{user.tickets_count}</td><td className="px-5 py-4 text-slate-600">{user.robots_count}</td><td className="px-5 py-4 text-slate-500">{formatDate(user.created_at)}</td></tr>)}</tbody></table></div><Pagination meta={query.data.meta} onPageChange={setPage} /></div>}</div>
  </AdminPage>
}

function RoleSelect({ user, update }) { return <select aria-label={`Role for ${user.name}`} value={user.role} onChange={(event) => update({ id: user.id, kind: 'role', value: event.target.value })} className="h-9 rounded-lg border px-2 text-sm">{roles.map((role) => <option key={role}>{role}</option>)}</select> }
function StatusToggle({ user, update }) { return <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><input type="checkbox" checked={user.is_active} onChange={(event) => update({ id: user.id, kind: 'status', value: event.target.checked })} className="h-4 w-4" /><span className={user.is_active ? 'text-green-600' : 'text-slate-500'}>{user.is_active ? 'Active' : 'Inactive'}</span></label> }
function UserCard({ user, update }) { return <article className="p-4"><div className="flex items-start justify-between gap-3"><div><strong className="text-slate-900">{user.name}</strong><p className="mt-1 break-all text-sm text-slate-500">{user.email}</p></div><StatusToggle user={user} update={update} /></div><div className="mt-4 flex items-center justify-between"><RoleSelect user={user} update={update} /><span className="text-xs text-slate-500">Joined {formatDate(user.created_at)}</span></div></article> }
