import { useMutation, useQuery } from '@tanstack/react-query'
import { PackageSearch } from 'lucide-react'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import { downloadDocument, getDocuments } from '../../api/documents'
import PageHeader from '../../components/common/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import DocumentCard from '../../components/documents/DocumentCard'
import { DocumentPage } from './DocumentLibrary'

export default function MyProductDocuments() {
  const robotsQuery = useQuery({ 
    queryKey: ['robots'], 
    queryFn: () => apiClient.get('/robots', { params: { per_page: 50 } }).then((response) => response.data.data) 
  })
  const documentsQuery = useQuery({ 
    queryKey: ['documents', 'my-products'], 
    queryFn: () => getDocuments({ per_page: 50 }), 
    enabled: robotsQuery.isSuccess 
  })
  const download = useMutation({ 
    mutationFn: downloadDocument, 
    onSuccess: () => toast.success('Download started'), 
    onError: (error) => toast.error(error.message || 'Unable to download document') 
  })
  
  const documents = useMemo(() => {
    // Ensure robotsQuery.data is an array
    const robots = Array.isArray(robotsQuery.data) ? robotsQuery.data : [];
    
    const productIds = new Set(robots.map((robot) => robot.product?.id).filter(Boolean))
    const familyIds = new Set(robots.map((robot) => robot.product?.family?.id).filter(Boolean))
    
    const docs = Array.isArray(documentsQuery.data?.data) ? documentsQuery.data.data : []
    
    return docs.filter((document) => 
      document.products?.some((product) => productIds.has(product.id)) || 
      document.families?.some((family) => familyIds.has(family.id))
    )
  }, [documentsQuery.data, robotsQuery.data])
  
  const loading = robotsQuery.isLoading || documentsQuery.isLoading
  const failed = robotsQuery.isError || documentsQuery.isError

  return (
    <DocumentPage>
      <PageHeader 
        eyebrow="Installed fleet" 
        title="My product documents" 
        description="Documentation selected for the robots registered to your account." 
        actions={<Link to="/documents" className="button button-secondary">All documents</Link>} 
      />
      <div className="mt-6">
        {loading && <LoadingState label="Matching documents to your products..." />}
        {failed && <ErrorState message="Unable to load product documents." onRetry={() => { robotsQuery.refetch(); documentsQuery.refetch() }} />}
        {!loading && !failed && documents.length === 0 && (
          <EmptyState 
            title="No product-specific documents" 
            description="Register a robot or browse the complete library for general resources." 
            action={<Link to="/robots/register" className="button button-primary"><PackageSearch size={17} />Register a robot</Link>} 
          />
        )}
        {documents.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <DocumentCard 
                key={document.id} 
                document={document} 
                onDownload={download.mutate} 
                downloading={download.isPending && download.variables?.id === document.id} 
              />
            ))}
          </div>
        )}
      </div>
    </DocumentPage>
  )
}