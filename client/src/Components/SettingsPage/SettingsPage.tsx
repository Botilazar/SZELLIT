// src/Pages/SettingsPage/SettingsPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { toast } from "react-hot-toast";
import LoadingAnimation from "../../Components/LoadingAnimation/LoadingAnimation";
import useDarkMode from "../../hooks/useDarkMode";
import { UserCircle2, UploadCloud } from "lucide-react";

interface UserData {
    user_id: number;
    fname: string;
    lname: string;
    email: string;
    prof_pic_url?: string;
    neptun: string;
}

const SettingsPage = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        if (!user) return;

        const fetchUser = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("accessToken") || "";
                const res = await fetch(`http://localhost:5000/api/users/${user.user_id}`, {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                });
                if (!res.ok) throw new Error("Failed to fetch user data");
                const data = await res.json();
                setFormData(data);
            } catch (err: any) {
                console.error(err);
                toast.error(err?.message || "Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [user]);

    const handleChange = (key: keyof UserData, value: string) => {
        if (!formData) return;
        setFormData({ ...formData, [key]: value });
    };

    const handleSave = async () => {
        if (!formData) return;
        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken") || "";
            const res = await fetch(`http://localhost:5000/api/users/${user?.user_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({
                    fname: formData.fname,
                    lname: formData.lname,
                    email: formData.email,
                    prof_pic_url: formData.prof_pic_url,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to update profile");
            }

            const updatedUser = await res.json();
            setFormData(updatedUser);
            login(updatedUser); // update context
            toast.success("Profile updated successfully!");
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !user) return;
        const file = e.target.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append("profile_pic", file);

        try {
            const token = localStorage.getItem("accessToken") || "";
            const res = await fetch(
                `http://localhost:5000/api/users/${user.user_id}/upload-profile-pic`,
                {
                    method: "POST",
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                    body: formDataUpload,
                }
            );

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to upload profile picture");
            }

            const updatedUser = await res.json();
            setFormData(updatedUser);
            login(updatedUser);
            toast.success("Profile picture updated!");
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Failed to upload profile picture");
        }
    };

    if (loading) return <LoadingAnimation />;
    if (!formData) return <div className="text-center p-10">User data not found</div>;

    return (
        <div className={`max-w-3xl mx-auto p-8 ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>
            <h1 className="text-3xl font-bold mb-6 text-center szellit-text">Account Settings</h1>

            {/* White/dark card container */}
            <div className={`szellit-navbar rounded-2xl shadow-md p-8 space-y-8`}>
                {/* Profile Picture */}
                <div className="relative w-32 h-32 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-md group cursor-pointer">
                    {formData.prof_pic_url ? (
                        <img
                            src={`http://localhost:5000${formData.prof_pic_url}`}
                            alt={`${formData.fname} ${formData.lname}`}
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <UserCircle2 className="w-20 h-20 text-gray-400 dark:text-gray-300" />
                    )}

                    {/* Hover overlay for upload */}
                    <label className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity cursor-pointer">
                        <UploadCloud className="text-white w-6 h-6" />
                        <input type="file" className="hidden" onChange={handleUpload} />
                    </label>
                </div>

                {/* Neptun Field (read-only) */}
                <div className="flex flex-col">
                    <label className="mb-1 font-medium">Neptun</label>
                    <input
                        type="text"
                        value={formData.neptun || ""}
                        disabled
                        className="w-full px-4 py-2 border rounded-md szellit-forminput cursor-not-allowed szellit-text"
                    />
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">First Name</label>
                        <input
                            type="text"
                            value={formData.fname}
                            onChange={(e) => handleChange("fname", e.target.value)}
                            className="px-4 py-2 border rounded-md szellit-forminput"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">Last Name</label>
                        <input
                            type="text"
                            value={formData.lname}
                            onChange={(e) => handleChange("lname", e.target.value)}
                            className="px-4 py-2 border rounded-md focus:ring-2 szellit-forminput"
                        />
                    </div>
                </div>

                {/* Email Field */}
                <div className="flex flex-col">
                    <label className="mb-1 font-medium">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full px-4 py-2 border rounded-md szellit-forminput"
                    />
                </div>


                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );


};

export default SettingsPage;
