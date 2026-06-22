import {
  Download,
  Eye,
  FileImage,
  FileText,
  Film,
  Presentation,
} from "lucide-react";
import { Link } from "react-router-dom";

const icons = {
  pdf: FileText,
  image: FileImage,
  video: Film,
  presentation: Presentation,
  other: FileText,
};
const typeStyles = {
  pdf: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  image: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  video:
    "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  presentation:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  other: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
};

export default function DocumentCard({
  document,
  onDownload,
  downloading = false,
}) {
  const Icon = icons[document.document_type] || FileText;

  return (
    <article className="group flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-[#111111]">
      <div className="relative grid h-36 place-items-center overflow-hidden bg-slate-100 dark:bg-zinc-950">
        {document.thumbnail ? (
          <img
            src={document.thumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon
            size={42}
            strokeWidth={1.5}
            className="text-slate-400 dark:text-zinc-600"
          />
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold uppercase ${typeStyles[document.document_type] || typeStyles.other}`}
        >
          {document.document_type}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase text-blue-600">
          {document.category?.name || "Document"}
        </p>
        <h2 className="mt-2 line-clamp-2 !text-lg !font-semibold text-slate-900 dark:text-white">
          <Link
            to={`/documents/${document.slug}`}
            className="hover:text-blue-600"
          >
            {document.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-zinc-400">
          {document.description || "No description provided."}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800">
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Eye size={14} />
            {document.view_count || 0} views
          </span>
          <button
            type="button"
            onClick={() => onDownload(document)}
            disabled={downloading || !document.upload?.url}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label={`Download ${document.title}`}
          >
            <Download size={15} />
            {downloading ? "Downloading" : "Download"}
          </button>
        </div>
      </div>
    </article>
  );
}
