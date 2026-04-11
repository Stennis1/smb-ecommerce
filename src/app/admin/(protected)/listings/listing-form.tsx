"use client";

import { useState } from "react";
import { useActionState } from "react";
import { ListingStatus } from "@/generated/prisma";
import type { ListingActionState } from "@/app/admin/(protected)/listings/actions";

const initialState: ListingActionState = {};

type ListingFormProps = {
  action: (
    state: ListingActionState,
    formData: FormData,
  ) => Promise<ListingActionState>;
  categories: {
    id: string;
    name: string;
    isActive: boolean;
  }[];
  submitLabel: string;
  defaultValues?: {
    id?: string;
    title?: string;
    description?: string;
    categoryId?: string;
    status?: ListingStatus;
    price?: string | null;
    currency?: string;
    location?: string | null;
    whatsappNumber?: string;
    coverImageKey?: string | null;
    metadata?: string;
    imageKeys?: string[];
  };
};

const statusOptions = [
  { value: ListingStatus.DRAFT, label: "Draft" },
  { value: ListingStatus.PUBLISHED, label: "Published" },
  { value: ListingStatus.ARCHIVED, label: "Archived" },
];

const MAX_UPLOAD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_UPLOAD_IMAGE_COUNT = 10;

export function ListingForm({
  action,
  categories,
  submitLabel,
  defaultValues,
}: ListingFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [imageKeys, setImageKeys] = useState(defaultValues?.imageKeys ?? []);
  const [coverImageKey, setCoverImageKey] = useState(
    defaultValues?.coverImageKey ?? "",
  );
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    if (imageKeys.length + files.length > MAX_UPLOAD_IMAGE_COUNT) {
      setUploadMessage(
        `You can upload up to ${MAX_UPLOAD_IMAGE_COUNT} images per listing.`,
      );
      return;
    }

    for (const file of Array.from(files)) {
      if (file.size > MAX_UPLOAD_IMAGE_SIZE_BYTES) {
        setUploadMessage("Each image must be 5MB or smaller.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setUploadMessage("Only image files can be uploaded.");
        return;
      }
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const uploadedKeys: string[] = [];

      for (const file of Array.from(files)) {
        const signResponse = await fetch("/api/uploads/sign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (!signResponse.ok) {
          const responseBody = (await signResponse.json().catch(() => null)) as
            | { message?: string }
            | null;

          throw new Error(
            responseBody?.message || "Could not prepare the upload.",
          );
        }

        const { uploadUrl, key } = (await signResponse.json()) as {
          key: string;
          uploadUrl: string;
        };

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Could not upload the file to S3.");
        }

        uploadedKeys.push(key);
      }

      setImageKeys((currentKeys) => {
        const nextKeys = [...currentKeys, ...uploadedKeys];

        if (!coverImageKey && nextKeys[0]) {
          setCoverImageKey(nextKeys[0]);
        }

        return nextKeys;
      });

      setUploadMessage("Image upload completed.");
    } catch (error) {
      setUploadMessage(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function removeImageKey(imageKey: string) {
    setImageKeys((currentKeys) => {
      const nextKeys = currentKeys.filter((key) => key !== imageKey);

      if (coverImageKey === imageKey) {
        setCoverImageKey(nextKeys[0] ?? "");
      }

      return nextKeys;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <input name="coverImageKey" type="hidden" value={coverImageKey} />
      {imageKeys.map((imageKey) => (
        <input key={imageKey} name="imageKeys" type="hidden" value={imageKey} />
      ))}

      {defaultValues?.id ? (
        <input name="id" type="hidden" value={defaultValues.id} />
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="title">
          Title
        </label>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          defaultValue={defaultValues?.title ?? ""}
          id="title"
          name="title"
          placeholder="Toyota Corolla 2020"
          required
          type="text"
        />
        {state.errors?.title ? (
          <p className="text-sm text-red-600">{state.errors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          className="min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          defaultValue={defaultValues?.description ?? ""}
          id="description"
          name="description"
          placeholder="Describe the listing clearly for public visitors."
          required
        />
        {state.errors?.description ? (
          <p className="text-sm text-red-600">{state.errors.description[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="categoryId"
          >
            Category
          </label>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            defaultValue={defaultValues?.categoryId ?? ""}
            id="categoryId"
            name="categoryId"
            required
          >
            <option disabled value="">
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.isActive ? "" : " (Inactive)"}
              </option>
            ))}
          </select>
          {state.errors?.categoryId ? (
            <p className="text-sm text-red-600">{state.errors.categoryId[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="status">
            Status
          </label>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            defaultValue={defaultValues?.status ?? ListingStatus.DRAFT}
            id="status"
            name="status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {state.errors?.status ? (
            <p className="text-sm text-red-600">{state.errors.status[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="price">
            Price
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            defaultValue={defaultValues?.price ?? ""}
            id="price"
            name="price"
            placeholder="12500.00"
            type="text"
          />
          {state.errors?.price ? (
            <p className="text-sm text-red-600">{state.errors.price[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="currency"
          >
            Currency
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase text-slate-900 outline-none transition focus:border-slate-500"
            defaultValue={defaultValues?.currency ?? "USD"}
            id="currency"
            maxLength={3}
            name="currency"
            placeholder="USD"
            required
            type="text"
          />
          {state.errors?.currency ? (
            <p className="text-sm text-red-600">{state.errors.currency[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="location"
          >
            Location
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            defaultValue={defaultValues?.location ?? ""}
            id="location"
            name="location"
            placeholder="Accra, Ghana"
            type="text"
          />
          {state.errors?.location ? (
            <p className="text-sm text-red-600">{state.errors.location[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="whatsappNumber"
          >
            WhatsApp number
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            defaultValue={defaultValues?.whatsappNumber ?? ""}
            id="whatsappNumber"
            name="whatsappNumber"
            placeholder="233201234567"
            required
            type="text"
          />
          {state.errors?.whatsappNumber ? (
            <p className="text-sm text-red-600">
              {state.errors.whatsappNumber[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="listing-images"
        >
          Listing images
        </label>
        <input
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          disabled={isUploading}
          id="listing-images"
          multiple
          onChange={(event) => {
            void handleFileUpload(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
          type="file"
        />
        <p className="text-sm leading-6 text-slate-600">
          Upload images to S3. The first uploaded image becomes the cover by
          default, and you can switch it below. Maximum 10 images, 5MB each.
        </p>
        {uploadMessage ? (
          <p
            className={`text-sm ${
              uploadMessage === "Image upload completed."
                ? "text-emerald-700"
                : "text-red-600"
            }`}
          >
            {uploadMessage}
          </p>
        ) : null}
        {state.errors?.coverImageKey ? (
          <p className="text-sm text-red-600">{state.errors.coverImageKey[0]}</p>
        ) : null}
        {state.errors?.imageKeys ? (
          <p className="text-sm text-red-600">{state.errors.imageKeys[0]}</p>
        ) : null}
      </div>

      {imageKeys.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Uploaded image keys</p>
          <div className="space-y-3">
            {imageKeys.map((imageKey) => (
              <div
                key={imageKey}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-slate-700">{imageKey}</p>
                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
                      <input
                        checked={coverImageKey === imageKey}
                        className="h-4 w-4"
                        name="cover-selection"
                        onChange={() => setCoverImageKey(imageKey)}
                        type="radio"
                      />
                      Use as cover image
                    </label>
                  </div>
                  <button
                    className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                    onClick={() => removeImageKey(imageKey)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="metadata">
          Metadata JSON
        </label>
        <textarea
          className="min-h-36 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-slate-500"
          defaultValue={defaultValues?.metadata ?? ""}
          id="metadata"
          name="metadata"
          placeholder='{"year": 2020, "transmission": "automatic"}'
        />
        {state.errors?.metadata ? (
          <p className="text-sm text-red-600">{state.errors.metadata[0]}</p>
        ) : null}
      </div>

      {state.errors?.id ? (
        <p className="text-sm text-red-600">{state.errors.id[0]}</p>
      ) : null}

      {state.message ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <button
        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
