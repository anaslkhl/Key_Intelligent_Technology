import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FileText } from 'lucide-react';
import { Link } from "react-router-dom";
import apiClient from "../../api/client";
import { downloadDocument, getDocuments } from "../../api/documents";
import PageHeader from "../../components/common/PageHeader";
import Pagination from "../../components/common/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/common/QueryState";
import DocumentCard from "../../components/documents/DocumentCard";
import DocumentFilter from "../../components/documents/DocumentFilter";

export default function DocumentLibrary() {
  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category_id: "",
    product_id: "",
    document_type: "",
  });
  const categoriesQuery = useQuery({
    queryKey: ["document-categories"],
    queryFn: () =>
      apiClient
        .get("/document-categories")
        .then((response) => response.data.data),
  });
  const familiesQuery = useQuery({
    queryKey: ["families"],
    queryFn: () =>
      apiClient.get("/families").then((response) => response.data.data),
  });
  const query = useQuery({
    queryKey: ["documents", { page, search, ...filters }],
    queryFn: () =>
      getDocuments({
        page,
        per_page: 12,
        search: search || undefined,
        category_id: filters.category_id || undefined,
        product_id: filters.product_id || undefined,
        document_type: filters.document_type || undefined,
      }),
  });
  const download = useMutation({
    mutationFn: downloadDocument,
    onSuccess: () => toast.success("Download started"),
    onError: (error) =>
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to download document",
      ),
  });
  const products = useMemo(
    () => (familiesQuery.data || []).flatMap((family) => family.products || []),
    [familiesQuery.data],
  );
  const documents = query.data?.data || [];

  const setFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  };

  return (
    <DocumentPage>
      <PageHeader
        icon={<FileText size={20} />}
        eyebrow="Resources"
        title="Document Library"
        description="Find technical manuals, brochures, product datasheets, and training materials."
        actions={
          <Link to="/documents/my-products" className="button button-secondary">
            My product documents
          </Link>
        }
      />
      <DocumentFilter
        draftSearch={draftSearch}
        filters={filters}
        categories={categoriesQuery.data}
        products={products}
        onSearchChange={setDraftSearch}
        onSearch={(event) => {
          event.preventDefault();
          setSearch(draftSearch.trim());
          setPage(1);
        }}
        onFilterChange={setFilter}
      />
      <div className="mt-6">
        {query.isLoading && <LoadingState label="Loading documents..." />}
        {query.isError && (
          <ErrorState
            message="Unable to load the document library."
            onRetry={query.refetch}
          />
        )}
        {query.isSuccess && documents.length === 0 && (
          <EmptyState
            title="No documents found"
            description="Try another search or remove one of the filters."
          />
        )}
        {documents.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDownload={download.mutate}
                  downloading={
                    download.isPending && download.variables?.id === document.id
                  }
                />
              ))}
            </div>
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#111111]">
              <Pagination meta={query.data.meta} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </DocumentPage>
  );
}

export function DocumentPage({ children }) {
  return (
    <section className="min-h-[calc(100vh-102px)] bg-slate-50 py-8 text-slate-900 dark:bg-black dark:text-white sm:py-10">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
