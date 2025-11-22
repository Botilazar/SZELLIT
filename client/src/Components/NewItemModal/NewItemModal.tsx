import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./NewItemModal.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

type ImageItem = {
  id: string;
  file: File;
  previewUrl: string;
  isCover: boolean;
  error?: string;
};

const MAX_IMAGES = 5;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const NewItemModal = ({ onClose, onSuccess }: Props) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Dinamikusan töltött kategóriák (névlista az API-ból)
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [errors, setErrors] = useState<{
    title?: string;
    category?: string;
    price?: string;
    description?: string;
    images?: string;
    submit?: string;
  }>({});

  // ===== Body scroll lock a modal ideje alatt =====
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // ===== Kategóriák betöltése az API-ból (névlista) =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch(`${API_URL}/api/categories`);
        if (!res.ok)
          throw new Error(`Failed to fetch categories (${res.status})`);
        const data: string[] = await res.json();
        if (!alive) return;
        setCategories(data);
        if (!category && data.length > 0) setCategory(data[0]);
      } catch (e) {
        console.error(e);
        if (alive) {
          setErrors((prev) => ({
            ...prev,
            category: t("errors.categoryLoadFailed"),
          }));
        }
      } finally {
        if (alive) setLoadingCategories(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [t]);

  // ===== Validáció =====
  useEffect(() => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = t("errors.titleRequired");
    else if (title.trim().length > 100) next.title = t("errors.titleTooLong");

    if (!category) next.category = t("errors.categoryRequired");

    const priceNumber = Number(price);
    if (price.trim() === "") next.price = t("errors.priceRequired");
    else if (Number.isNaN(priceNumber) || priceNumber < 0)
      next.price = t("errors.priceInvalid");

    if (description.trim().length > 1000)
      next.description = t("errors.descriptionTooLong");

    if (images.length > MAX_IMAGES)
      next.images = t("errors.tooManyImages", { count: MAX_IMAGES });

    setErrors(next);
  }, [title, category, price, description, images, t]);

  const isFormValid = useMemo(() => {
    const hasRequired =
      title.trim() !== "" &&
      category !== "" &&
      price.trim() !== "" &&
      !Number.isNaN(Number(price)) &&
      Number(price) >= 0;
    const hasNoErrors = Object.values(errors).every((e) => !e);
    const allImageFilesOk = images.every(
      (img) =>
        ALLOWED_TYPES.includes(img.file.type) &&
        img.file.size <= MAX_SIZE_BYTES
    );
    return hasRequired && hasNoErrors && allImageFilesOk && !submitting;
  }, [errors, images, price, title, category, submitting]);

  // ===== Képfájlok kezelése (előnézet stb.) =====
  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const current = [...images];
    const next: ImageItem[] = [];
    for (const file of Array.from(fileList)) {
      if (current.length + next.length >= MAX_IMAGES) break;

      let error: string | undefined;
      if (!ALLOWED_TYPES.includes(file.type)) error = t("errors.imageType");
      else if (file.size > MAX_SIZE_BYTES) error = t("errors.imageSize");

      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      next.push({ id, file, previewUrl, isCover: false, error });
    }
    const merged = [...current, ...next];
    if (!merged.some((m) => m.isCover) && merged.length > 0) {
      merged[0].isCover = true;
    }
    setImages(merged);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (filtered.length > 0 && !filtered.some((f) => f.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const setCover = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isCover: img.id === id }))
    );
  };

  // ===== Helper: user_id kiszedése a JWT-ből =====
  const getUserIdFromToken = (): number | null => {
    try {
      const token = localStorage.getItem("accessToken") || "";
      if (!token) return null;
      const [, payloadB64] = token.split(".");
      if (!payloadB64) return null;
      const payloadJson = atob(
        payloadB64.replace(/-/g, "+").replace(/_/g, "/")
      );
      const payload = JSON.parse(payloadJson);
      const uid = payload.user_id ?? payload.sub ?? payload.uid;
      return typeof uid === "number" ? uid : Number(uid) || null;
    } catch {
      return null;
    }
  };

  // ===== Helper: képek feltöltése az itemhez =====
  async function uploadItemImages(
    itemId: number,
    files: File[],
    coverIndex: number | null
  ) {
    const token = localStorage.getItem("accessToken") || "";
    const form = new FormData();
    // ha a backend upload.array("images")-t vár, itt "images" legyen
    files.forEach((f) => form.append("images[]", f));
    if (coverIndex !== null && coverIndex >= 0) {
      form.append("coverIndex", String(coverIndex));
    }
    const res = await fetch(`${API_URL}/api/items/${itemId}/images`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      body: form,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `Képfeltöltés sikertelen (${res.status}) ${errText}`.trim()
      );
    }
    return res.json();
  }

  // ===== Submit: item létrehozása → képek feltöltése =====
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setSubmitting(true);
      setErrors((prev) => ({ ...prev, submit: undefined }));

      const token = localStorage.getItem("accessToken") || "";
      const user_id = getUserIdFromToken();
      if (!user_id)
        throw new Error(
          t("errors.submitFailedNoAuth") ?? "Hiányzó bejelentkezés."
        );

      const priceInt = Math.round(Number(price));

      const idx = categories.indexOf(category);
      if (idx < 0) throw new Error(t("errors.categoryRequired") as string);
      const category_id = idx + 1;

      const createRes = await fetch(`${API_URL}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          user_id,
          title: title.trim(),
          description: description.trim(),
          price: priceInt,
          category_id,
        }),
      });

      if (!createRes.ok) {
        const text = await createRes.text().catch(() => "");
        throw new Error(
          `${t("errors.submitFailed")} (${createRes.status}) ${text || ""}`.trim()
        );
      }

      const createdItem = await createRes.json();
      const newItemId: number = createdItem?.item_id;
      if (!newItemId) throw new Error("Hiányzik az új item_id a válaszból.");

      if (images.length > 0) {
        const files = images.map((i) => i.file);
        const coverIndex = images.findIndex((i) => i.isCover);
        await uploadItemImages(
          newItemId,
          files,
          coverIndex >= 0 ? coverIndex : null
        );
      }

      // csak SIKERES upload után zárjuk a modalt
      onSuccess();
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        submit: err?.message ?? String(err),
      }));
      setSubmitting(false);
    }
  };

  // ===== ESC kilépés / URL.releaseObjectURL cleanup =====
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
  }, [images]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Overlay – már NEM onClick-es, csak háttér */}
      <div className="new-item-overlay" />

      <div
        ref={dialogRef}
        className="new-item-modal-card"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("newItem.titlePage")}</h2>
          <button
            onClick={onClose}
            className="new-item-close-btn"
            aria-label={t("actions.cancel")}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Képek (előnézet/drag&drop) */}
          <div>
            <label className="block font-medium mb-2">
              {t("newItem.photosLabel")}
            </label>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`new-item-dropzone ${dragOver ? "drag-over" : ""}`}
              aria-label={t("newItem.dragArea")}
            >
              <p className="mb-3">{t("newItem.dragHelp")}</p>
              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={onFileInput}
                className="hidden"
              />
              <label htmlFor="file-input" className="new-item-file-button">
                {t("newItem.chooseFiles")}
              </label>
              <p className="new-item-helper-text">
                {t("newItem.fileRules", { max: MAX_IMAGES })}
              </p>
            </div>
            {errors.images && (
              <p className="new-item-error-text">{errors.images}</p>
            )}

            {images.length > 0 && (
              <div className="new-item-thumbs">
                {images.map((img) => (
                  <div key={img.id} className="new-item-thumb">
                    <img src={img.previewUrl} alt="" />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="new-item-thumb-delete"
                      aria-label={t("actions.delete")}
                      title={t("actions.delete")}
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      onClick={() => setCover(img.id)}
                      className={`new-item-thumb-cover ${
                        img.isCover ? "is-cover" : ""
                      }`}
                      aria-pressed={img.isCover}
                      aria-label={t("actions.setCover")}
                      title={t("actions.setCover")}
                    >
                      ★ {img.isCover ? t("labels.cover") : t("actions.setCover")}
                    </button>
                    {img.error && (
                      <div className="new-item-thumb-error">
                        {img.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block font-medium mb-1">
              {t("labels.title")} *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              className="new-item-input"
              placeholder={t("placeholders.title") ?? ""}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="new-item-error-text">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block font-medium mb-1">
              {t("labels.category")} *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="new-item-select"
              aria-invalid={!!errors.category}
              disabled={loadingCategories}
            >
              {!loadingCategories && categories.length === 0 && (
                <option value="">
                  {t("placeholders.selectCategory")}
                </option>
              )}
              {loadingCategories && (
                <option value="">{t("labels.loading")}</option>
              )}
              {!loadingCategories &&
                categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
            {errors.category && (
              <p className="new-item-error-text">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block font-medium mb-1">
              {t("labels.price")} *
            </label>
            <input
              id="price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="new-item-input"
              placeholder={t("placeholders.price") ?? ""}
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <p className="new-item-error-text">{errors.price}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block font-medium mb-1">
              {t("labels.description")} ({t("labels.optional")})
            </label>
            <textarea
              id="description"
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
              className="new-item-textarea"
              placeholder={t("placeholders.description") ?? ""}
              aria-invalid={!!errors.description}
            />
            <div className="flex justify-between text-xs mt-1">
              <span>{t("labels.maxChars", { n: 1000 })}</span>
              <span>{description.length}/1000</span>
            </div>
            {errors.description && (
              <p className="new-item-error-text">{errors.description}</p>
            )}
          </div>

          <div className="new-item-footer">
            <button
              type="button"
              onClick={onClose}
              className="new-item-btn-cancel"
            >
              {t("actions.cancel")}
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="new-item-btn-submit"
            >
              {submitting ? t("actions.uploading") : t("actions.upload")}
            </button>
          </div>

          {errors.submit && (
            <p className="new-item-error-text">{errors.submit}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewItemModal;
