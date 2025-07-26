import { MapPin, Heart, MessageCircle, UserCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface DetailedItemProps {
  item: {
    title: string;
    description: string;
    price: number;
    seller_city: string;
    seller_name: string;
    created_at: string;
    category_name: string;
    img_url?: string;
    item_id: number;
  };
  isFavorited: boolean;
  onToggleFavorite: (itemId: number, isNowFavorited: boolean) => void;
}

const DetailedItem = ({ item, isFavorited, onToggleFavorite }: DetailedItemProps) => {
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(isFavorited);

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  const handleFavoriteClick = async () => {
    const url = "http://localhost:5000/api/favorites";
    const method = favorited ? "DELETE" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.item_id }),
      });
      setFavorited(!favorited);
      onToggleFavorite(item.item_id, !favorited);
    } catch (err) {
      console.error("Failed to update favorite", err);
    }
  };

  return (
    <div className="">
      <div className="w-full h-64 mb-4 rounded-xl overflow-hidden bg-gray-200 flex justify-center items-center">
        {item.img_url ? (
          <img src={item.img_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl font-bold text-gray-500">{t("itemCard.noImage", "Nincs kép")}</div>
        )}
      </div>

      <div className="flex justify-between mb-2 text-sm text-gray-500">
        <span className="bg-blue-100 text-blue-600 rounded-full px-3 py-1 text-sm">
          {t(`categories.${item.category_name}`, item.category_name)}
        </span>
        <span className="szellit-text">{new Date(item.created_at).toLocaleDateString("hu-HU")}</span>
      </div>

      <h2 className="text-2xl font-bold mb-1">{item.title}</h2>
      <p className="szellit-text mb-4 whitespace-pre-wrap">{item.description}</p>

      <div className="flex justify-between items-center mb-4">
        <span className="text-blue-600 text-3xl font-extrabold">
          {item.price.toLocaleString("hu-HU")} Ft
        </span>
        <div className="flex items-center text-sm szellit-text">
          <MapPin className="w-4 h-4 mr-1" />
          {item.seller_city}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <UserCircle2 className="w-6 h-6 text-gray-500" />
          </div>
          <span className="text-sm font-medium">{item.seller_name}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleFavoriteClick}
            className={`szellit-text hover:text-red-500 ${favorited ? "text-red-500" : ""}`}
          >
            <Heart className={`w-5 h-5 ${favorited ? "fill-red-500" : ""}`} />
          </button>
          <button className="szellit-text hover:text-blue-500">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedItem;
