import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useDarkMode from "../../hooks/useDarkMode";

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
  const { isDarkMode } = useDarkMode();
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

  const modalCardBase =
    "relative max-h-[90vh] w-[min(95vw,900px)] overflow-y-auto rounded-2xl p-6 md:p-8 shadow-xl ring-1 transition-colors";
  const modalCardClass = isDarkMode
    ? `${modalCardBase} bg-gray-900 text-gray-100 ring-white/10`
    : `${modalCardBase} bg-white text-gray-900 ring-black/10`;

  const overlayClass = isDarkMode ? "bg-black/60" : "bg-black/40";

  const dropBase = "border-2 border-dashed rounded-xl p-6 text-center transition";
  const dropClass = dragOver
    ? isDarkMode
      ? `${dropBase} border-blue-400 bg-blue-900/30`
      : `${dropBase} border-blue-500 bg-blue-50`
    : isDarkMode
      ? `${dropBase} border-gray-600`
      : `${dropBase} border-gray-300`;

  const inputBase = "w-full rounded-xl border px-3 py-2 placeholder:opacity-70";
  const inputClass = isDarkMode
    ? `${inputBase} bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400`
    : `${inputBase} bg-white border-gray-300 text-gray-900 placeholder-gray-500`;

  const selectClass = inputClass + (isDarkMode ? " bg-gray-800" : " bg-white");

  const iconBtnBase = "rounded-full grid place-items-center shadow";
  const deleteBtnClass = isDarkMode
    ? `absolute top-2 right-2 ${iconBtnBase} w-8 h-8 bg-gray-900/90 text-gray-100 hover:bg-gray-900`
    : `absolute top-2 right-2 ${iconBtnBase} w-8 h-8 bg-white/90 text-gray-800 hover:bg-white`;

  const coverBtnClass = (active: boolean) =>
    active
      ? "absolute bottom-2 right-2 rounded-full px-2 py-1 text-xs shadow bg-yellow-400 text-black"
      : isDarkMode
        ? "absolute bottom-2 right-2 rounded-full px-2 py-1 text-xs shadow bg-gray-900/90 text-gray-100 hover:bg-gray-900"
        : "absolute bottom-2 right-2 rounded-full px-2 py-1 text-xs shadow bg-white/90 text-gray-800 hover:bg-white";

  const cancelBtnClass = isDarkMode
    ? "px-4 py-2 rounded-xl border border-gray-700 hover:bg-gray-800"
    : "px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50";

  const submitBtnClass = (enabled: boolean) =>
    enabled
      ? "px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition"
      : "px-4 py-2 rounded-xl text-white bg-gray-400 cursor-not-allowed";

  // ===== Kategóriák betöltése az API-ból (névlista) =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch("http://localhost:5000/api/categories");
        if (!res.ok) throw new Error(`Failed to fetch categories (${res.status})`);
        const data: string[] = await res.json();
        if (!alive) return;
        setCategories(data);
        if (!category && data.length > 0) setCategory(data[0]);
      } catch (e) {
        console.error(e);
        if (alive) setErrors((prev) => ({ ...prev, category: t("errors.categoryLoadFailed") }));
      } finally {
        if (alive) setLoadingCategories(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [t]); // csak egyszer

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
      (img) => ALLOWED_TYPES.includes(img.file.type) && img.file.size <= MAX_SIZE_BYTES
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
    if (!merged.some((m) => m.isCover) && merged.length > 0) merged[0].isCover = true;
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
      if (filtered.length > 0 && !filtered.some((f) => f.isCover)) filtered[0].isCover = true;
      return filtered;
    });
  };

  const setCover = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === id })));
  };

  // ===== Helper: user_id kiszedése a JWT-ből (mint korábban) =====
  const getUserIdFromToken = (): number | null => {
    try {
      const token = localStorage.getItem("accessToken") || "";
      if (!token) return null;
      const [, payloadB64] = token.split(".");
      if (!payloadB64) return null;
      const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadJson);
      const uid = payload.user_id ?? payload.sub ?? payload.uid;
      return typeof uid === "number" ? uid : Number(uid) || null;
    } catch {
      return null;
    }
  };

  // ===== Helper: képek feltöltése az itemhez (ugyanolyan minta, mint a profilképnél) =====
  async function uploadItemImages(itemId: number, files: File[], coverIndex: number | null) {
    const token = localStorage.getItem("accessToken") || "";
    const form = new FormData();
    files.forEach((f) => form.append("images[]", f));
    if (coverIndex !== null && coverIndex >= 0) {
      form.append("coverIndex", String(coverIndex));
    }
    const res = await fetch(`http://localhost:5000/api/items/${itemId}/images`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      body: form,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Képfeltöltés sikertelen (${res.status}) ${errText}`.trim());
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

      // 1) Item létrehozása (JSON)
      const token = localStorage.getItem("accessToken") || "";
      const user_id = getUserIdFromToken();
      if (!user_id) throw new Error(t("errors.submitFailedNoAuth") ?? "Hiányzó bejelentkezés.");

      const priceInt = Math.round(Number(price));

      // Kategória ID: mivel /api/categories csak névlistát ad, index+1 alapján feltételezzük
      const idx = categories.indexOf(category);
      if (idx < 0) throw new Error(t("errors.categoryRequired") as string);
      const category_id = idx + 1;

      const createRes = await fetch("http://localhost:5000/api/items", {
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
        throw new Error(`${t("errors.submitFailed")} (${createRes.status}) ${text || ""}`.trim());
      }

      const createdItem = await createRes.json();
      const newItemId: number = createdItem?.item_id;
      if (!newItemId) throw new Error("Hiányzik az új item_id a válaszból.");

      // 2) Képek feltöltése (ha vannak)
      if (images.length > 0) {
        const files = images.map((i) => i.file);
        const coverIndex = images.findIndex((i) => i.isCover);
        await uploadItemImages(newItemId, files, coverIndex >= 0 ? coverIndex : null);
      }

      // 3) Siker
      onSuccess();
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, submit: err?.message ?? String(err) }));
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
      <div className={`absolute inset-0 ${overlayClass}`} onClick={onClose} />

      <div ref={dialogRef} className={modalCardClass} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("newItem.titlePage")}</h2>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full grid place-items-center border ${
              isDarkMode
                ? "border-gray-700 text-gray-200 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            aria-label={t("actions.cancel")}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Képek (előnézet/drag&drop) — a feltöltés külön végpontra megy a submit után */}
          <div>
            <label className="block font-medium mb-2">{t("newItem.photosLabel")}</label>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={dropClass}
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
              <label
                htmlFor="file-input"
                className={`inline-block px-4 py-2 rounded-xl cursor-pointer ${
                  isDarkMode ? "bg-gray-700 text-gray-100 hover:bg-gray-600" : "bg-gray-800 text-white hover:bg-black/80"
                }`}
              >
                {t("newItem.chooseFiles")}
              </label>
              <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {t("newItem.fileRules", { max: MAX_IMAGES })}
              </p>
            </div>
            {errors.images && <p className="text-sm text-red-600 mt-2">{errors.images}</p>}

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`relative rounded-lg overflow-hidden border ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <img src={img.previewUrl} alt="" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className={deleteBtnClass}
                      aria-label={t("actions.delete")}
                      title={t("actions.delete")}
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      onClick={() => setCover(img.id)}
                      className={coverBtnClass(img.isCover)}
                      aria-pressed={img.isCover}
                      aria-label={t("actions.setCover")}
                      title={t("actions.setCover")}
                    >
                      ★ {img.isCover ? t("labels.cover") : t("actions.setCover")}
                    </button>
                    {img.error && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white text-xs px-2 py-1">
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
              className={inputClass}
              placeholder={t("placeholders.title") ?? ""}
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block font-medium mb-1">
              {t("labels.category")} *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
              aria-invalid={!!errors.category}
              disabled={loadingCategories}
            >
              {!loadingCategories && categories.length === 0 && (
                <option value="">{t("placeholders.selectCategory")}</option>
              )}
              {loadingCategories && <option value="">{t("labels.loading")}</option>}
              {!loadingCategories &&
                categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
            {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
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
              className={inputClass}
              placeholder={t("placeholders.price") ?? ""}
              aria-invalid={!!errors.price}
            />
            {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
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
              className={`${inputClass} h-32`}
              placeholder={t("placeholders.description") ?? ""}
              aria-invalid={!!errors.description}
            />
            <div className={`flex justify-between text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              <span>{t("labels.maxChars", { n: 1000 })}</span>
              <span>{description.length}/1000</span>
            </div>
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className={cancelBtnClass}>
              {t("actions.cancel")}
            </button>
            <button type="submit" disabled={!isFormValid} className={submitBtnClass(isFormValid)}>
              {submitting ? t("actions.uploading") : t("actions.upload")}
            </button>
          </div>

          {errors.submit && <p className="text-sm text-red-700">{errors.submit}</p>}
        </form>
      </div>
    </div>
  );
};

export default NewItemModal;
