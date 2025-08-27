import { useParams } from "react-router-dom";
import { useEffect, useState, MouseEvent } from "react";
import { Heart } from "lucide-react";
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation";

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
}

const DetailedItemPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const start = Date.now();

    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/items/${itemId}`);
        if (!res.ok) throw new Error("Item fetch failed");
        const data: Item = await res.json();

        const token = localStorage.getItem("accessToken") || "";
        const favRes = await fetch("http://localhost:5000/api/favourites", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (!favRes.ok) throw new Error("Favorites fetch failed");
        const favData: number[] = await favRes.json();

        if (alive) {
          setItem(data);
          setSelectedImg(data.img_urls?.[0] || null);
          setFavoriteIds(favData);

          // enforce minimum 0.5s loading time
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

  const handleFavoriteClick = async (
    e: MouseEvent<HTMLButtonElement>,
    itemId: number
  ) => {
    e.stopPropagation();
    const isFavorited = favoriteIds.includes(itemId);
    const url = "http://localhost:5000/api/favourites";
    const method = isFavorited ? "DELETE" : "POST";
    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
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

  // Loader only in the content area
  if (loading) {
    return <LoadingAnimation />;
  }

  if (!item)
    return <p className="text-center mt-20 text-gray-500">Failed to load item.</p>;

  const isFavorite = favoriteIds.includes(item.item_id);

  return (
    <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left: Images & Description */}
      <div className="lg:col-span-2 space-y-6">
        {selectedImg && (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={selectedImg}
              alt={item.title}
              className="w-full h-[550px] object-cover"
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

      {/* Right: Sidebar */}
      <aside className="space-y-6 ">
        <div className="szellit-navbar rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-blue-600">
              {item.price.toLocaleString("hu-HU")} Ft
            </span>
            <button
              onClick={(e) => handleFavoriteClick(e, item.item_id)}
              className={`text-gray-500 hover:text-red-500 ${isFavorite ? "text-red-500" : ""
                }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? "fill-red-500" : ""}`} />
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <p>
              <span className="font-semibold">Seller:</span> {item.seller_name}
            </p>
            <p>
              <span className="font-semibold">City:</span> {item.seller_city}
            </p>
            <p>
              <span className="font-semibold">Category:</span> {item.category_name}
            </p>
            <p className="text-sm text-gray-400">
              Listed on {new Date(item.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DetailedItemPage;
