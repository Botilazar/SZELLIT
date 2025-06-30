import { MapPin, Heart, MessageCircle, UserCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

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
}: ItemCardProps) => {
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
        body: JSON.stringify({ item_id: itemId }),
      });
      setFavorited(!favorited);
      onToggleFavorite(itemId, !favorited);
    } catch (err) {
      console.error("Failed to update favorite", err);
    }
  };

  return (
    <div className="relative w-[340px] h-[470px] bg-white shadow-lg rounded-[15px] p-4 overflow-hidden">
      {/* Image */}
      <div className="absolute top-0 left-0 right-0 h-[225px] rounded-t-[15px] overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-3xl font-black text-gray-600">
            Nincs kép
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-[225px] pb-5">
        <div className="mt-4 flex justify-between items-center">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
            {category}
          </div>
          <div className="text-sm text-gray-500">{date}</div>
        </div>

        <div className="mt-2 font-semibold text-lg">{title}</div>
        <div className="text-sm text-gray-600 line-clamp-2 relative min-h-[3 rem]">
          {description}
          <span className="invisible block">.</span>
        </div>



        <div className="mt-2 flex justify-between items-center">
          <div className="text-blue-600 font-extrabold text-2xl">
            {price.toLocaleString("hu-HU")} Ft
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            {location}
          </div>
        </div>

        <hr className="my-4 border-gray-300" />

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
    </div>
  );
};

export default ItemCard;
