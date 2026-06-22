import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getDocument } from '../../api/documents'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import DocumentPermissionEditor from '../../components/documents/DocumentPermissionEditor'
import { StaffPage } from '../documents/ManageDocuments'

export default function DocumentPermissions() {
  const { id } = useParams()
  const query = useQuery({ queryKey: ['document-manage', id], queryFn: () => getDocument(id) })
  if (query.isLoading) return <StaffPage><LoadingState label="Loading permission editor..." /></StaffPage>
  if (query.isError) return <StaffPage><ErrorState message="Unable to load this document." onRetry={query.refetch} /></StaffPage>
  return <StaffPage><DocumentPermissionEditor document={query.data} /></StaffPage>
}
