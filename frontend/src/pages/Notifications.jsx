import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
// import { Bell } from 'lucide-react';
import apiClient from "../api/client";
import PageHeader from "../components/common/PageHeader";
import Pagination from "../components/common/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/common/QueryState";
import { formatDateTime } from "../utils/formatters";



export default function Notifications() {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["notifications", page],
    queryFn: () =>
      apiClient
        .get("/notifications", { params: { page, per_page: 15 } })
        .then((response) => response.data),
  });
  const action = useMutation({
    mutationFn: ({ kind, id }) =>
      kind === "read-all"
        ? apiClient.patch("/notifications/read-all")
        : kind === "read"
          ? apiClient.patch(`/notifications/${id}/read`)
          : apiClient.delete(`/notifications/${id}`),
    onSuccess: (_, values) => {
      toast.success(
        values.kind === "delete"
          ? "Notification deleted"
          : values.kind === "read-all"
            ? "All notifications marked as read"
            : "Notification marked as read",
      );
      client.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Unable to update notification"),
  });
  const notifications = query.data?.data || [];
  const hasUnread = notifications.some((item) => !item.read_at);

  return (
    <NotificationPage>
      <PageHeader
        icon={<Bell size={20} />}
        eyebrow="Updates"
        title="Notifications"
        description="Stay informed about ticket updates, community activity, and product announcements."
      />
      <div className="mt-6">
        {query.isLoading && <LoadingState label="Loading notifications..." />}
        {query.isError && (
          <ErrorState
            message="Unable to load notifications."
            onRetry={query.refetch}
          />
        )}
        {query.isSuccess && notifications.length === 0 && (
          <EmptyState
            title="You are all caught up"
            description="New support activity will appear here."
          />
        )}
        {notifications.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="divide-y divide-slate-200">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  busy={action.isPending}
                  onAction={(kind) =>
                    action.mutate({ kind, id: notification.id })
                  }
                />
              ))}
            </div>
            <Pagination meta={query.data.meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </NotificationPage>
  );
}

function NotificationRow({ notification, busy, onAction }) {
  const title =
    notification.data?.title ||
    notification.data?.subject ||
    readableType(notification.type);
  const content =
    notification.data?.message ||
    notification.data?.content ||
    notification.data?.body ||
    "There is new activity in your support workspace.";
  return (
    <article
      className={`flex gap-4 p-4 sm:p-5 ${notification.read_at ? "" : "bg-blue-50"}`}
    >
      <span
        className={`mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg ${notification.read_at ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-700"}`}
      >
        <Bell size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="!text-base !font-semibold text-slate-900">{title}</h2>
          {!notification.read_at && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold uppercase text-white">
              New
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-600">{content}</p>
        <p className="mt-2 text-xs text-slate-500">
          {formatDateTime(notification.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {!notification.read_at && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction("read")}
            className="icon-button"
            aria-label="Mark notification as read"
            title="Mark as read"
          >
            <Check size={16} />
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => onAction("delete")}
          className="icon-button text-red-600"
          aria-label="Delete notification"
          title="Delete notification"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
function readableType(type = "") {
  const name = type
    .split("\\")
    .pop()
    ?.replace(/Notification$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
  return name || "Support notification";
}
function NotificationPage({ children }) {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-[900px] px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
