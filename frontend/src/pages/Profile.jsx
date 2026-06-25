import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, Building2, KeyRound, Mail, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { User } from 'lucide-react';
import apiClient from "../api/client";
import { applyFieldErrors, parseApiError } from "../api/errors";
import PageHeader from "../components/common/PageHeader";
import { ErrorState, LoadingState } from "../components/common/QueryState";
import { useAuth } from "../contexts/auth";



export default function Profile() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient.get("/me").then((response) => response.data.data),
  });
  const profileForm = useForm({
    defaultValues: { name: "", company_name: "" },
  });
  const passwordForm = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });
  useEffect(() => {
    if (query.data)
      profileForm.reset({
        name: query.data.name || "",
        company_name: query.data.company_name || "",
      });
  }, [query.data, profileForm]);
  const profile = useMutation({
    mutationFn: (values) => apiClient.patch("/profile", values),
    onSuccess: async () => {
      await refreshUser();
      toast.success("Profile updated");
    },
    onError: (error) =>
      applyErrors(error, profileForm, "Unable to update profile"),
  });
  const preferences = useMutation({
    mutationFn: (values) =>
      apiClient.patch("/notification-preferences", values),
    onSuccess: async () => {
      await refreshUser();
      toast.success("Notification preferences updated");
      query.refetch();
    },
    onError: () => toast.error("Unable to update notification preferences"),
  });
  const password = useMutation({
    mutationFn: (values) => apiClient.post("/change-password", values),
    onSuccess: () => {
      toast.success("Password changed. Please sign in again.");
      window.dispatchEvent(new Event("kit:unauthorized"));
      navigate("/login", { replace: true });
    },
    onError: (error) =>
      applyErrors(error, passwordForm, "Unable to change password"),
  });

  if (query.isLoading)
    return (
      <ProfilePage>
        <LoadingState label="Loading your profile..." />
      </ProfilePage>
    );
  if (query.isError)
    return (
      <ProfilePage>
        <ErrorState
          message="Unable to load your profile."
          onRetry={query.refetch}
        />
      </ProfilePage>
    );
  const prefs = query.data.notification_preferences || {
    email: true,
    in_app: true,
  };

  return (
    <ProfilePage>
      <PageHeader
        icon={<User size={20} />}
        eyebrow="Account"
        title="Profile Settings"
        description="Manage your personal information, password, and notification preferences."
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={profileForm.handleSubmit((values) =>
            profile.mutate(values),
          )}
          className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
        >
          <SectionTitle
            icon={UserRound}
            title="Profile information"
            description="Your details as they appear across the support hub."
          />
          {profileForm.formState.errors.root?.server && (
            <Alert message={profileForm.formState.errors.root.server.message} />
          )}
          <div className="mt-5 grid gap-4">
            <Field
              label="Name"
              icon={UserRound}
              error={profileForm.formState.errors.name}
            >
              <input
                className={inputClass}
                {...profileForm.register("name", {
                  required: "Name is required",
                  maxLength: { value: 255, message: "Maximum 255 characters" },
                })}
              />
            </Field>
            <Field label="Email" icon={Mail}>
              <input
                value={query.data.email}
                disabled
                className={`${inputClass} opacity-70`}
              />
            </Field>
            <Field
              label="Company"
              icon={Building2}
              error={profileForm.formState.errors.company_name}
            >
              <input
                className={inputClass}
                {...profileForm.register("company_name", {
                  maxLength: { value: 255, message: "Maximum 255 characters" },
                })}
              />
            </Field>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={profile.isPending}
              className="button button-primary"
            >
              {profile.isPending ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
        <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
          <SectionTitle
            icon={Bell}
            title="Notifications"
            description="Choose how KIT Support Hub can contact you."
          />
          <div className="mt-5 divide-y divide-slate-200">
            <Preference
              label="Email notifications"
              description="Receive ticket activity and support updates by email."
              checked={Boolean(prefs.email)}
              disabled={preferences.isPending}
              onChange={(email) => preferences.mutate({ ...prefs, email })}
            />
            <Preference
              label="In-app notifications"
              description="Show updates in your notification inbox."
              checked={Boolean(prefs.in_app)}
              disabled={preferences.isPending}
              onChange={(in_app) => preferences.mutate({ ...prefs, in_app })}
            />
          </div>
        </section>
        <form
          onSubmit={passwordForm.handleSubmit((values) =>
            password.mutate(values),
          )}
          className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2"
        >
          <SectionTitle
            icon={KeyRound}
            title="Change password"
            description="Changing your password signs out all active sessions."
          />
          {passwordForm.formState.errors.root?.server && (
            <Alert
              message={passwordForm.formState.errors.root.server.message}
            />
          )}
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field
              label="Current password"
              error={passwordForm.formState.errors.current_password}
            >
              <input
                type="password"
                autoComplete="current-password"
                className={inputClass}
                {...passwordForm.register("current_password", {
                  required: "Current password is required",
                })}
              />
            </Field>
            <Field
              label="New password"
              error={passwordForm.formState.errors.new_password}
            >
              <input
                type="password"
                autoComplete="new-password"
                className={inputClass}
                {...passwordForm.register("new_password", {
                  required: "New password is required",
                  minLength: { value: 8, message: "Use at least 8 characters" },
                })}
              />
            </Field>
            <Field
              label="Confirm new password"
              error={passwordForm.formState.errors.new_password_confirmation}
            >
              <input
                type="password"
                autoComplete="new-password"
                className={inputClass}
                {...passwordForm.register("new_password_confirmation", {
                  required: "Confirm your new password",
                  validate: (value) =>
                    value === passwordForm.getValues("new_password") ||
                    "Passwords do not match",
                })}
              />
            </Field>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={password.isPending}
              className="button button-primary"
            >
              {password.isPending ? "Changing..." : "Change password"}
            </button>
          </div>
        </form>
      </div>
    </ProfilePage>
  );
}

function applyErrors(error, form, fallback) {
  const parsed = parseApiError(error, fallback);
  applyFieldErrors(form.setError, parsed.fieldErrors);
  form.setError("root.server", { message: parsed.message });
}
function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-3">
      <span className="state-icon">
        <Icon size={21} />
      </span>
      <div>
        <h2 className="!text-lg !font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
function Field({ label, icon: Icon, error, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      <span className="inline-flex items-center gap-2">
        {Icon && <Icon size={15} />}
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-red-600">{error.message}</span>}
    </label>
  );
}
function Preference({ label, description, checked, disabled, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 py-5">
      <span>
        <strong className="block text-sm text-slate-900">{label}</strong>
        <span className="mt-1 block text-sm text-slate-500">{description}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0"
      />
    </label>
  );
}
function Alert({ message }) {
  return (
    <div
      role="alert"
      className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
    >
      {message}
    </div>
  );
}
const inputClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900";
function ProfilePage({ children }) {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
