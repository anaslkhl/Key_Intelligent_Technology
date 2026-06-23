import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/client";
import { applyFieldErrors, parseApiError } from "../../api/errors";
import {
  documentTypes,
  documentVisibilities,
  getDocument,
  inferDocumentType,
} from "../../api/documents";
import PageHeader from "../../components/common/PageHeader";
import { ErrorState, LoadingState } from "../../components/common/QueryState";
import DocumentUploader from "../../components/documents/DocumentUploader";
import { useAuth } from "../../contexts/auth";
import { StaffPage } from "../documents/ManageDocuments";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-zinc-700 dark:bg-[#111111] dark:text-white";
const defaults = {
  title: "",
  slug: "",
  description: "",
  category_id: "",
  document_type: "pdf",
  visibility: "client",
  is_published: false,
  version: "1.0",
  language: "en",
  product_family_ids: [],
  product_ids: [],
  solution_type_ids: [],
};
const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function DocumentForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors, dirtyFields },
  } = useForm({ defaultValues: defaults });
  const title = useWatch({ control, name: "title" });
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
  const solutionsQuery = useQuery({
    queryKey: ["solution-types"],
    queryFn: () =>
      apiClient.get("/solution-types").then((response) => response.data.data),
  });
  const documentQuery = useQuery({
    queryKey: ["document-manage", id],
    queryFn: () => getDocument(id),
    enabled: isEditing,
  });
  const products = useMemo(
    () =>
      (familiesQuery.data || []).flatMap((family) =>
        (family.products || []).map((product) => ({
          ...product,
          family_name: family.name,
        })),
      ),
    [familiesQuery.data],
  );

  useEffect(() => {
    if (!dirtyFields.slug && !isEditing) setValue("slug", slugify(title));
  }, [dirtyFields.slug, isEditing, setValue, title]);
  useEffect(() => {
    if (!documentQuery.data) return;
    const document = documentQuery.data;
    reset({
      title: document.title,
      slug: document.slug,
      description: document.description || "",
      category_id: document.category?.id || "",
      document_type: document.document_type,
      visibility: document.visibility,
      is_published: document.is_published,
      version: document.version,
      language: document.language,
      product_family_ids: document.families?.map((family) => family.id) || [],
      product_ids: document.products?.map((product) => product.id) || [],
      solution_type_ids:
        document.solution_types?.map((solution) => solution.id) || [],
    });
  }, [documentQuery.data, reset]);

  const save = useMutation({
    mutationFn: async (values) => {
      let uploadId = documentQuery.data?.upload?.id;
      if (file) {
        const body = new FormData();
        body.append("document", file);
        const uploadResponse = await apiClient.post("/documents/upload", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadId = uploadResponse.data.data.id;
      }
      if (!uploadId) throw new Error("Choose a document file.");
      const payload = {
        ...values,
        upload_id: uploadId,
        description: values.description || null,
        is_published: Boolean(values.is_published),
        product_family_ids: values.product_family_ids || [],
        product_ids: values.product_ids || [],
        solution_type_ids: values.solution_type_ids || [],
      };
      return isEditing
        ? apiClient.put(`/documents/${id}`, payload)
        : apiClient.post("/documents", payload);
    },

    onSuccess: () => {
      toast.success(isEditing ? "Document updated" : "Document created");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["manage-documents"] });
      navigate(user.role === "admin" ? "/admin/documents" : "/agent/documents");
    },
    onError: (error) => {
      const parsed = parseApiError(error, "Unable to save document");
      applyFieldErrors(setError, parsed.fieldErrors);
      if (!file && !documentQuery.data?.upload) setFileError(parsed.message);
      setError("root.server", { message: parsed.message });
    },
  });
  const loading =
    categoriesQuery.isLoading ||
    familiesQuery.isLoading ||
    solutionsQuery.isLoading ||
    (isEditing && documentQuery.isLoading);
  const failed =
    categoriesQuery.isError ||
    familiesQuery.isError ||
    solutionsQuery.isError ||
    documentQuery.isError;

  if (loading)
    return (
      <StaffPage>
        <LoadingState label="Loading document editor..." />
      </StaffPage>
    );
  if (failed)
    return (
      <StaffPage>
        <ErrorState
          message="Unable to load the document editor."
          onRetry={() => {
            categoriesQuery.refetch();
            familiesQuery.refetch();
            solutionsQuery.refetch();
            documentQuery.refetch();
          }}
        />
      </StaffPage>
    );

  return (
    <StaffPage>
      <PageHeader
        eyebrow="Document operations"
        title={isEditing ? "Edit document" : "Create document"}
        description="Upload a resource, define its audience, and connect it to the relevant KIT products and solutions."
      />
      <form
        onSubmit={handleSubmit((values) => save.mutate(values))}
        className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#111111] sm:p-6">
          {errors.root?.server && (
            <div className="form-alert" role="alert">
              {errors.root.server.message}
            </div>
          )}
          <Field label="Title" error={errors.title}>
            <input
              className={inputClass}
              {...register("title", { required: "Title is required" })}
            />
          </Field>
          <Field label="Slug" error={errors.slug}>
            <input
              className={inputClass}
              {...register("slug", { required: "Slug is required" })}
            />
          </Field>
          <Field label="Description" error={errors.description}>
            <textarea
              rows="5"
              className="w-full rounded-lg border border-slate-300 p-3 text-sm"
              {...register("description")}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" error={errors.category_id}>
              <select
                className={inputClass}
                {...register("category_id", {
                  required: "Category is required",
                })}
              >
                <option value="">Select category</option>
                {categoriesQuery.data.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Document type" error={errors.document_type}>
              <select
                className={`${inputClass} capitalize`}
                {...register("document_type")}
              >
                {documentTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Field>
            <Field label="Visibility" error={errors.visibility}>
              <select
                className={`${inputClass} capitalize`}
                {...register("visibility")}
              >
                {documentVisibilities.map((visibility) => (
                  <option key={visibility}>{visibility}</option>
                ))}
              </select>
            </Field>
            <Field label="Language" error={errors.language}>
              <input
                className={inputClass}
                {...register("language", { required: true })}
              />
            </Field>
            <Field label="Version" error={errors.version}>
              <input
                className={inputClass}
                {...register("version", { required: true })}
              />
            </Field>
            <label className="flex items-center gap-3 self-end rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-zinc-800">
              <input type="checkbox" {...register("is_published")} />
              Publish immediately
            </label>
          </div>
        </div>
        <aside className="grid content-start gap-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#111111]">
            <h2 className="!text-base !font-semibold">Document file</h2>
            <div className="mt-4">
              <DocumentUploader
                file={file}
                currentFileName={documentQuery.data?.upload?.original_name}
                error={fileError}
                onChange={(nextFile, nextError) => {
                  setFile(nextFile);
                  setFileError(nextError);
                  if (nextFile)
                    setValue(
                      "document_type",
                      inferDocumentType(nextFile.name),
                      { shouldDirty: true },
                    );
                }}
              />
            </div>
          </section>
          <RelationGroup
            title="Product families"
            items={familiesQuery.data}
            name="product_family_ids"
            register={register}
          />
          <RelationGroup
            title="Products"
            items={products}
            name="product_ids"
            register={register}
            renderLabel={(product) =>
              `${product.model} · ${product.family_name}`
            }
          />
          <RelationGroup
            title="Solution types"
            items={solutionsQuery.data}
            name="solution_type_ids"
            register={register}
          />
        </aside>
        <div className="flex flex-col-reverse gap-3 xl:col-span-2 sm:flex-row sm:justify-end">
          <Link
            to={user.role === "admin" ? "/admin/documents" : "/agent/documents"}
            className="button button-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={save.isPending}
            className="button button-primary"
          >
            {save.isPending
              ? "Saving document..."
              : isEditing
                ? "Save changes"
                : "Create document"}
          </button>
        </div>
      </form>
    </StaffPage>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-200">
      <span>{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error.message}</span>}
    </label>
  );
}
function RelationGroup({
  title,
  items = [],
  name,
  register,
  renderLabel = (item) => item.name,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#111111]">
      <h2 className="!text-base !font-semibold">{title}</h2>
      <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto pr-1">
        {items.length === 0 && (
          <p className="text-sm text-slate-500">No options available.</p>
        )}
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <input
              type="checkbox"
              value={item.id}
              {...register(name)}
              className="mt-0.5"
            />
            <span>{renderLabel(item)}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
