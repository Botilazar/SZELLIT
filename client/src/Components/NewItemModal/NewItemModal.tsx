import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import "./NewItemModal.css";
import { resolveImgUrl } from "../../utils/imageHelpers";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  editItem?: any;
};

type ImageItem = {
  id: string;
  file?: File;
  previewUrl: string;
  isCover: boolean;
  error?: string;
  existingUrl?: string;
};

const MAX_IMAGES = 5;



const NewItemModal = ({ onClose, onSuccess, editItem }: Props) => {
  const { t } = useTranslation();
  const isEditMode = !!editItem;
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

  const [title, setTitle] = useState(editItem?.title || "");
  const [category, setCategory] = useState<string>(editItem?.category_name || "");
  const [price, setPrice] = useState<string>(editItem?.price?.toString() || "");
  const [description, setDescription] = useState(editItem?.description || "");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [, setErrors] = useState<{
    title?: string;
    category?: string;
    price?: string;
    description?: string;
    images?: string;
    submit?: string;
  }>({});

  useEffect(() => {
    if (isEditMode && editItem.img_urls) {
      const existingImages: ImageItem[] = editItem.img_urls.map((url: string, idx: number) => ({
        id: crypto.randomUUID(),
        previewUrl: resolveImgUrl(url) || "",
        isCover: idx === 0,
        existingUrl: url
      }));
      setImages(existingImages);
    }
  }, [isEditMode, editItem]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch(`${API_URL}/api/categories`);
        if (!res.ok) throw new Error(`Failed to fetch categories`);
        const data: string[] = await res.json();
        if (!alive) return;
        setCategories(data);
        if (!category && data.length > 0) setCategory(data[0]);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoadingCategories(false);
      }
    })();
    return () => { alive = false; };
  }, [category]);

  const isFormValid = useMemo(() => {
    const hasRequired = title.trim() !== "" && category !== "" && price.trim() !== "" && !Number.isNaN(Number(price));
    return hasRequired && !submitting;
  }, [price, title, category, submitting]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const current = [...images];
    const next: ImageItem[] = [];
    for (const file of Array.from(fileList)) {
      if (current.length + next.length >= MAX_IMAGES) break;
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      next.push({ id, previewUrl, isCover: false, file });
    }
    const merged = [...current, ...next];
    if (!merged.some((m) => m.isCover) && merged.length > 0) merged[0].isCover = true;
    setImages(merged);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken") || "";
      const category_id = categories.indexOf(category) + 1;

      const itemUrl = isEditMode ? `${API_URL}/api/items/${editItem.item_id}` : `${API_URL}/api/items`;
      const itemMethod = isEditMode ? "PUT" : "POST";

      const res = await fetch(itemUrl, {
        method: itemMethod,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include", // Megoldja a 401-es hibát
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: Math.round(Number(price)),
          category_id,
        }),
      });

      if (!res.ok) toast.error("Sikertelen mentés");
      ;

      const responseData = await res.json();
      const targetItemId = isEditMode ? editItem.item_id : responseData.item_id;

      const formData = new FormData();
      const coverIndex = images.findIndex(img => img.isCover);

      if (isEditMode) {
        const existingUrls = images.filter(img => img.existingUrl).map(img => img.existingUrl);
        const newFiles = images.filter(img => img.file).map(img => img.file as File);
        formData.append("existing", JSON.stringify(existingUrls));
        newFiles.forEach(f => formData.append("images[]", f));
        formData.append("coverIndex", String(coverIndex >= 0 ? coverIndex : 0));

        await fetch(`${API_URL}/api/items/${targetItemId}/images`, {
          method: "PUT",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          credentials: "include",
          body: formData,
        });
      } else {
        images.forEach(img => { if (img.file) formData.append("images[]", img.file); });
        formData.append("coverIndex", String(coverIndex >= 0 ? coverIndex : 0));

        await fetch(`${API_URL}/api/items/${targetItemId}/images`, {
          method: "POST",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          credentials: "include",
          body: formData,
        });
      }

      onSuccess();

    } catch (err: any) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={dialogRef}
          /* Megtartottuk az eredeti kártya osztályaidat */
          className="new-item-modal-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {isEditMode ? "Szerkesztés" : t("newitemmodal.popup")}
            </h2>
            <button onClick={onClose} className="new-item-close-btn">×</button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-2">{t("newitemmodal.photolabel")}</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className={`new-item-dropzone ${dragOver ? "drag-over" : ""}`}
              >
                <p className="mb-3">{t("newitemmodal.drag")}</p>
                <input id="file-input" type="file" accept="image/jpeg,image/png" multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
                <label htmlFor="file-input" className="new-item-file-button">{t("newitemmodal.choosefiles")}</label>
              </div>

              {images.length > 0 && (
                <div className="new-item-thumbs">
                  {images.map((img) => (
                    <div key={img.id} className="new-item-thumb">
                      <img src={img.previewUrl} alt="" />
                      <button type="button" onClick={() => setImages(prev => prev.filter(p => p.id !== img.id))} className="new-item-thumb-delete">×</button>
                      <button type="button" onClick={() => setImages(prev => prev.map(i => ({ ...i, isCover: i.id === img.id })))} className={`new-item-thumb-cover ${img.isCover ? "is-cover" : ""}`}>
                        ★ {img.isCover ? t("labels.cover") : t("actions.setCover")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">{t("newitemmodal.advertisementname")} *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="new-item-input" maxLength={100} />
            </div>

            <div>
              <label className="block font-medium mb-1">{t("newitemmodal.category")} *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="new-item-select" disabled={loadingCategories}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">{t("newitemmodal.price")} *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="new-item-input" />
            </div>

            <div>
              <label className="block font-medium mb-1">{t("newitemmodal.description")}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="new-item-textarea" maxLength={1000} />
            </div>

            <div className="new-item-footer">
              <button type="button" onClick={onClose} className="new-item-btn-cancel">{t("newitemmodal.cancel")}</button>
              <button type="submit" disabled={!isFormValid} className="new-item-btn-submit">
                {submitting ? "Mentés..." : (isEditMode ? "Mentés" : t("newitemmodal.upload"))}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewItemModal;