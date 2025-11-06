import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, MouseEvent, useRef } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation";
//import useDarkMode from "../../hooks/useDarkMode";
import { useAuth } from "../../AuthContext";
import PleaseLogin from "../Other/pleaseLogin";


interface Item {
  item_id: number;
  title: string;
  description: string;
  price: number;
  created_at: string;
  category_name: string;
  seller_name: string;
  seller_city: string;
  img_urls?: string[];
  user_id: number;
}

const DetailedItemPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();


  const [item, setItem] = useState<Item | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { itemId, lng } = useParams<{ itemId: string; lng: string }>();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);


  // 🚨 Guard route: if not logged in, block access
  if (!user) {
    return (
      <PleaseLogin />)
  }

  useEffect(() => {
    let alive = true;
    const start = Date.now();

    (async () => {
      const API_URL = import.meta.env.VITE_API_BASE_URL;

      try {
        const res = await fetch(`${API_URL}/api/items/${itemId}`);
        if (!res.ok) throw new Error("Item fetch failed");
        const data: Item = await res.json();

        let favData: number[] = [];

        const favRes = await fetch(`${API_URL}/api/favourites`, {
          credentials: "include",
        });
        if (favRes.ok) favData = await favRes.json();

        if (alive) {
          setItem(data);
          setSelectedImg(data.img_urls?.[0] || null);
          setFavoriteIds(favData);

          const elapsed = Date.now() - start;
          const remaining = 500 - elapsed;
          if (remaining > 0) setTimeout(() => setLoading(false), remaining);
          else setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [itemId]);



  // Detect click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFavoriteClick = async (e: MouseEvent<HTMLButtonElement>, itemId: number) => {
    e.stopPropagation();

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const isFavorited = favoriteIds.includes(itemId);
    const method = isFavorited ? "DELETE" : "POST";

    try {
      const res = await fetch(`${API_URL}/api/favourites`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ item_id: itemId }),
      });

      if (!res.ok) throw new Error(`Favorite request failed (${res.status})`);

      setFavoriteIds((prev) =>
        isFavorited ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    } catch (err) {
      console.error("Failed to update favorite", err);
    }
  };

  if (loading) return <LoadingAnimation />;
  if (!item)
    return (
      <p className="text-center mt-20 text-gray-500">Failed to load item.</p>
    );

  const isFavorite = favoriteIds.includes(item.item_id);

  return (
    <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left side: images & description */}
      <div className="lg:col-span-2 space-y-6">
        {selectedImg && (
          <div className="szellit-navbar rounded-2xl overflow-hidden shadow-lg w-full h-[550px] flex items-center justify-center">
            <img
              src={selectedImg}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {item.img_urls && item.img_urls.length > 1 && (
          <div className="flex gap-3">
            {item.img_urls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImg(url)}
                className={`rounded-lg overflow-hidden shadow-sm border-2 transition ${selectedImg === url
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300"
                  }`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="h-20 w-28 object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
          <p className="szellit-text leading-relaxed text-justify">
            {item.description}
          </p>
        </div>
      </div>

      {/* Right side: price, seller, contact */}
      <aside className="space-y-6">
        {/* Price & seller info card */}
        <div className="szellit-navbar rounded-2xl shadow-md p-6 relative">
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-blue-600">
              {item.price.toLocaleString("hu-HU")} Ft
            </span>

            <div className="flex items-center gap-3 relative">
              {/* Heart icon */}
              <button
                onClick={(e) => handleFavoriteClick(e, item.item_id)}
                className={`text-gray-500 hover:text-red-500 ${isFavorite ? "text-red-500" : ""
                  }`}
                title="Add to favorites"
              >
                <Heart className={`w-6 h-6 ${isFavorite ? "fill-red-500" : ""}`} />
              </button>

              {/* Three dots dropdown */}
              {user && user.user_id === item.user_id && (
                <div className="relative" ref={menuRef}>
                  <button
                    className="text-gray-500 hover:text-blue-500"
                    onClick={() => setShowMenu((prev) => !prev)}
                    title="More options"
                  >
                    <MoreHorizontal className="w-6 h-6" />
                  </button>

                  {showMenu && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg overflow-hidden transition-all duration-200 animate-slide-down z-50 szellit-navbar ring-1 ring-gray-300 dark:ring-gray-700"
                    >
                      <button
                        className="w-full text-left px-4 py-2 szellit-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <p>
              <span className="font-semibold">Seller:</span>{" "}
              <span
                onClick={() => { navigate(`/${lng}/profiles/${item.user_id}`); console.log(`${lng}/profiles/${item.user_id}`) }}
                className="hover:text-blue-500 cursor-pointer"
              >
                {item.seller_name}
              </span>
            </p>
            <p>
              <span className="font-semibold">City:</span> {item.seller_city}
            </p>
            <p>
              <span className="font-semibold">Category:</span>{" "}
              {item.category_name}
            </p>
            <p className="text-sm text-gray-400">
              Listed on {new Date(item.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Contact card */}
        <div className="szellit-navbar rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">Contact Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Email:</span>{" "}
              <a href="mailto:placeholder@email.com" className="kkm-text hover:text-blue-500">
                placeholder@email.com
              </a>
            </p>
            <p>
              <span className="font-semibold">Facebook:</span>{" "}
              <a href="#" className="kkm-text hover:text-blue-500">
                placeholder
              </a>
            </p>
            <p>
              <span className="font-semibold">Instagram:</span>{" "}
              <a href="#" className="kkm-text hover:text-blue-500">
                Coming soon
              </a>
            </p>
          </div>
        </div>
      </aside>
    </div>
  );




};

export default DetailedItemPage;
