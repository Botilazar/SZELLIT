import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, Facebook, Instagram, UserCircle2 } from "lucide-react";
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation";
import ItemCard from "../ItemCard/ItemCard";
import useDarkMode from "../../hooks/useDarkMode";
import PleaseLogin from "../Other/pleaseLogin";

interface User {
    user_id: number;
    email: string;
    fname: string;
    lname: string;
    prof_pic_url?: string;
}

interface Item {
    item_id: number;
    title: string;
    description: string;
    price: number;
    created_at: string;
    category_name: string;
    city: string;
    seller_name: string;
    image_url?: string;
}

const ProfilePage = () => {
    const { userId, lng } = useParams<{ userId: string; lng: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);
    const { isDarkMode } = useDarkMode();
    const navigate = useNavigate();

    useEffect(() => {
        let alive = true;

        const check401 = (res: Response) => {
            if (res.status === 401) {
                setUnauthorized(true);
                return true;
            }
            return false;
        };

        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("accessToken") || "";

                // Fetch user
                const resUser = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                });

                if (check401(resUser)) return;
                if (!resUser.ok) throw new Error("Failed to fetch user");
                const userData = await resUser.json();

                // Fetch user items
                const resItems = await fetch(`http://localhost:5000/api/users/${userId}/items`, {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                });

                if (check401(resItems)) return;
                if (!resItems.ok) throw new Error("Failed to fetch items");
                const itemData = await resItems.json();

                if (alive) {
                    setUser(userData);
                    setItems(itemData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (alive) setLoading(false);
            }
        };

        fetchData();
        return () => {
            alive = false;
        };
    }, [userId]);

    if (loading) return <LoadingAnimation />;
    if (unauthorized)
        return <PleaseLogin />; // user must log in to see this page
    if (!user) return <div className="text-center p-10">User not found</div>;

    return (
        <div className={`max-w-7xl mx-auto p-8 space-y-10 ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 items-center szellit-navbar p-6 rounded-2xl shadow-md">
                {/* Profile Picture */}
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                    {user.prof_pic_url ? (
                        <img
                            src={`http://localhost:5000${user.prof_pic_url}`}
                            alt={`${user.fname} ${user.lname}`}
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <UserCircle2 className="w-20 h-20 text-gray-400" />
                    )}
                </div>

                {/* User Info */}
                <div className="flex flex-col gap-2 text-center md:text-left">
                    <h1 className="text-3xl font-bold">{user.lname} {user.fname}</h1>
                    <p className="text-gray-500">{user.email}</p>
                </div>
            </div>

            {/* Contact Info */}
            <div className="szellit-navbar p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">Contact</h2>
                <div className="flex gap-6 items-center">
                    <a href={`mailto:${user.email}`} className="flex items-center gap-2 hover:text-blue-500">
                        <Mail className="w-5 h-5" /> {user.email}
                    </a>
                    <span className="flex items-center gap-2 text-gray-400 cursor-not-allowed">
                        <Facebook className="w-5 h-5" /> facebook.com/username
                    </span>
                    <span className="flex items-center gap-2 text-gray-400 cursor-not-allowed">
                        <Instagram className="w-5 h-5" /> instagram.com/username
                    </span>
                </div>
            </div>

            {/* Listings */}
            <div>
                <h2 className="text-2xl font-bold mb-6 szellit-text">{user.fname}'s Listings</h2>
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <ItemCard
                                key={item.item_id}
                                category={item.category_name}
                                date={new Date(item.created_at).toLocaleDateString()}
                                title={item.title}
                                description={item.description}
                                price={item.price}
                                location={item.city}
                                sellerName={item.seller_name}
                                imgUrl={item.image_url}
                                itemId={item.item_id}
                                isFavorited={false} // handled inside ItemCard now
                                sellerProfilePic={`http://localhost:5000${user.prof_pic_url}`}
                                onCardClick={() => navigate(`/${lng}/items/${item.item_id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No listings yet.</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
