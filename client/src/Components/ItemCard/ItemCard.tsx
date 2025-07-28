import { MapPin, Heart, MessageCircle, UserCircle2 } from "lucide-react";
import { useState, useEffect, MouseEvent } from "react";
import { useTranslation } from "react-i18next";

interface ItemCardProps {
  category: string;
  date: string;
  title: string;
  description: string;
  price: number;
  location: string;
  sellerName: string;
  imgUrl?: string;
  itemId: number;
  isFavorited: boolean;
  onToggleFavorite: (itemId: number, isNowFavorited: boolean) => void;
  onCardClick?: () => void;
}

const ItemCard = ({
  category,
  date,
  title,
  description,
  price,
  location,
  sellerName,
  imgUrl,
  itemId,
  isFavorited,
  onToggleFavorite,
  onCardClick,
}: ItemCardProps) => {
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(isFavorited);

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  const handleFavoriteClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const url = "http://localhost:5000/api/favorites";
    const method = favorited ? "DELETE" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
      });
      setFavorited(!favorited);
      onToggleFavorite(itemId, !favorited);
    } catch (err) {
      console.error("Failed to update favorite", err);
    }
  };

  return (
    <div className="szellit-navbar relative w-[340px] h-[470px] shadow-lg rounded-[15px] p-4 overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[225px] rounded-t-[15px] overflow-hidden cursor-pointer"
        onClick={onCardClick}
      >
        {imgUrl ? (
          <img src={imgUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-black text-gray-600">
            {t("itemCard.noImage", "Nincs kép")}
          </div>
        )}
      </div>

      <div
        className="szellit-navbar mt-[225px] pb-5 cursor-pointer"
        onClick={onCardClick}
      >
        <div className="mt-4 flex justify-between items-center">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
            {t(`categories.${category}`, category)}
          </div>
          <div className="text-sm szellit-text">{date}</div>
        </div>

        <div className="mt-2 font-semibold text-lg szellit-text">{title}</div>
        <div className="text-sm szellit-text line-clamp-2 relative min-h-[3rem] ">
          {description}
          <span className="invisible block">.</span>
        </div>

        <div className=" flex justify-between items-center">
          <div className="text-blue-600 font-extrabold text-2xl ">
            {price.toLocaleString("hu-HU")} Ft
          </div>
          <div className="flex items-center gap-1 text-sm szellit-text">
            <MapPin className="w-4 h-4" />
            {location}
          </div>
        </div>
      </div>

      <hr className="mb-3 szellit-br" />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <UserCircle2 className="w-6 h-6 text-gray-500" />
          </div>
          <span className="text-sm font-medium">{sellerName}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleFavoriteClick}
            className={`text-gray-500 hover:text-red-500 ${favorited ? "text-red-500" : ""
              }`}
          >
            <Heart className={`w-5 h-5 ${favorited ? "fill-red-500" : ""}`} />
          </button>
          <button className="text-gray-500 hover:text-blue-500">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
