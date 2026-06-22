import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, Eye, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { downloadDocument, getDocument } from "../../api/documents";
import { ErrorState, LoadingState } from "../../components/common/QueryState";
import DocumentPreview from "../../components/documents/DocumentPreview";
import { formatDate } from "../../utils/formatters";
import { DocumentPage } from "./DocumentLibrary";

export default function DocumentDetail() {
  const { slug } = useParams();
  const query = useQuery({
    queryKey: ["document", slug],
    queryFn: () => getDocument(slug),
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

  if (query.isLoading)
    return (
      <DocumentPage>
        <LoadingState label="Loading document..." />
      </DocumentPage>
    );
  if (query.isError)
    return (
      <DocumentPage>
        <ErrorState
          message="This document is unavailable or you do not have access."
          onRetry={query.refetch}
        />
      </DocumentPage>
    );

  const document = query.data;
  return (
    <DocumentPage>
      <Link
        to="/documents"
        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        ← Back to document library
      </Link>
      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main>
          <DocumentPreview document={document} />
        </main>
        <aside className="self-start rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#111111]">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <FileText size={15} />
            {document.document_type}
          </span>
          <h1 className="mt-4 !text-2xl !font-bold text-slate-900 dark:text-white">
            {document.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-400">
            {document.description || "No description provided."}
          </p>
          <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm dark:border-zinc-800">
            <Meta label="Category" value={document.category?.name} />
            <Meta label="Version" value={document.version} />
            <Meta label="Language" value={document.language?.toUpperCase()} />
            <Meta label="Published" value={formatDate(document.published_at)} />
            <Meta
              label="File size"
              value={formatBytes(document.upload?.size)}
            />
          </dl>
          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Eye size={14} />
              {document.view_count} views
            </span>
            <span>{document.download_count} downloads</span>
          </div>
          <button
            type="button"
            onClick={() => download.mutate(document)}
            disabled={download.isPending}
            className="button button-primary mt-5 w-full"
          >
            <Download size={17} />
            {download.isPending ? "Preparing..." : "Download document"}
          </button>
        </aside>
      </div>
    </DocumentPage>
  );
}

function Meta({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-800 dark:text-zinc-200">
        {value || "—"}
      </dd>
    </div>
  );
}
function formatBytes(value) {
  if (!value && value !== 0) return "—";
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 ** 2).toFixed(1)} MB`;
}
