import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { toast } from "react-hot-toast";
import LoadingAnimation from "../../Components/LoadingAnimation/LoadingAnimation";
import useDarkMode from "../../hooks/useDarkMode";
import { UserCircle2, UploadCloud, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import CropModal from "../CropModal/cropModal";

interface UserData {
  user_id: number;
  fname: string;
  lname: string;
  email: string;
  prof_pic_url?: string;
  neptun: string;
}

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isDarkMode } = useDarkMode();
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);

  useEffect(() => {
    //if (authLoading) return;

    if (!user?.user_id) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      const API_URL = import.meta.env.VITE_API_BASE_URL;

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/users/${user.user_id}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error(t("settings.fetchError"));
        const data = await res.json();
        setFormData(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || t("settings.fetchError"));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user, t]);

  const handleChange = (key: keyof UserData, value: string) => {
    if (!formData) return;
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = async () => {
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    if (!formData) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${user?.user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fname: formData.fname,
          lname: formData.lname,
          email: formData.email,
          prof_pic_url: formData.prof_pic_url,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || t("settings.saveError"));
      }

      const updatedUser = await res.json();
      setFormData(updatedUser);
      login(updatedUser);
      toast.success(t("settings.saveSuccess"));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || t("settings.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setCropFile(e.target.files[0]);
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!user) return;
    setUploadingPic(true);

    const start = Date.now();
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("profile_pic", croppedFile);

      const res = await fetch(
        `${API_URL}/api/users/${user.user_id}/upload-profile-pic`,
        {
          method: "POST",
          credentials: "include",
          body: formDataUpload,
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || t("settings.uploadError"));
      }

      const updatedUser = await res.json();
      setFormData(updatedUser);
      login(updatedUser);
      toast.success(t("settings.uploadSuccess"));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || t("settings.uploadError"));
    } finally {
      const elapsed = Date.now() - start;
      const wait = elapsed < 500 ? 500 - elapsed : 0;
      setTimeout(() => setUploadingPic(false), wait);
      setCropFile(null);
    }
  };

  const handleRemoveProfilePic = async () => {
    if (!user) return;
    setUploadingPic(true);

    const start = Date.now();
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      const res = await fetch(
        `${API_URL}/api/users/${user.user_id}/profile-pic`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to remove profile picture");

      const updatedUser = await res.json();
      setFormData(updatedUser);
      login(updatedUser);
      toast.success("Profile picture removed");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to remove profile picture");
    } finally {
      const elapsed = Date.now() - start;
      const wait = elapsed < 500 ? 500 - elapsed : 0;
      setTimeout(() => setUploadingPic(false), wait);
    }
  };

  if (loading) return <LoadingAnimation />;
  if (!formData)
    return <div className="text-center p-10">{t("settings.userNotFound")}</div>;

  return (
    <div
      className={`max-w-3xl mx-auto p-8 ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
    >
      <h1 className="text-3xl font-bold mb-6 text-center szellit-text">
        {t("settings.title")}
      </h1>

      <div className={`szellit-navbar rounded-2xl shadow-md p-8 space-y-8`}>
        {/* Profile Picture Wrapper */}
        <div className="relative w-32 h-32 mx-auto">
          {/* Avatar circle */}
          <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-md group cursor-pointer">
            {formData.prof_pic_url && !uploadingPic ? (
              <img
                src={`http://localhost:5000${formData.prof_pic_url}`}
                alt={`${formData.fname} ${formData.lname}`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : !formData.prof_pic_url && !uploadingPic ? (
              <UserCircle2 className="w-20 h-20 text-gray-400 dark:text-gray-300" />
            ) : (
              <LoadingAnimation />
            )}

            {/* Upload overlay */}
            <label className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full bg-black bg-opacity-40 transition-opacity cursor-pointer">
              <UploadCloud className="text-white w-6 h-6" />
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* Remove button OUTSIDE the circle */}
          {formData.prof_pic_url && !uploadingPic && (
            <button
              onClick={handleRemoveProfilePic}
              className="absolute -bottom-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Other form fields */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">{t("settings.neptun")}</label>
          <input
            type="text"
            value={formData.neptun || ""}
            disabled
            className="w-full px-4 py-2 border rounded-md szellit-forminput cursor-not-allowed szellit-text"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">
              {t("settings.firstName")}
            </label>
            <input
              type="text"
              value={formData.fname}
              onChange={(e) => handleChange("fname", e.target.value)}
              className="px-4 py-2 border rounded-md szellit-forminput"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">{t("settings.lastName")}</label>
            <input
              type="text"
              value={formData.lname}
              onChange={(e) => handleChange("lname", e.target.value)}
              className="px-4 py-2 border rounded-md focus:ring-2 szellit-forminput"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">{t("settings.email")}</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-2 border rounded-md szellit-forminput"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {saving ? t("settings.saving") : t("settings.saveChanges")}
        </button>
      </div>

      {/* Crop modal */}
      {cropFile && (
        <CropModal
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default SettingsPage;
