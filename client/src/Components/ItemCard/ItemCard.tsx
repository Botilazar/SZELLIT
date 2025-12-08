import { MapPin, Heart, MessageCircle, UserCircle2 } from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { toast } from "react-hot-toast";
import { useAuth } from "../../AuthContext";
import { useNavigate, useParams } from "react-router-dom";

interface ItemCardProps {
  category: string;
  date: string;
  title: string;
  description: string;
  price: number;
  location: string;
  sellerName: string;
  sellerId: number;
  imgUrl?: string;
  itemId: number;
  isFavorited: boolean;
  sellerProfilePic?: string;
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
  sellerId,
  imgUrl,
  itemId,
  isFavorited: initialFavorited,
  sellerProfilePic,
  onCardClick,
}: ItemCardProps) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const navigate = useNavigate();
  const { lng } = useParams();

  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleFavoriteClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("You must log in to favorite items!");
      return;
    }

    const newState = !isFavorited;

    const method = newState ? "POST" : "DELETE";

    try {
      const res = await fetch(`${API_URL}/api/favourites`, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      setIsFavorited(newState);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update favorites!");
    }
  };

  return (
    <div
      className="szellit-navbar relative w-[340px] h-[480px] shadow-md rounded-2xl overflow-hidden
                 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform duration-200"
      onClick={onCardClick}
    >
      {/* Image */}
      <div className="relative h-[225px] w-full overflow-hidden rounded-t-2xl">
        {imgUrl ? (
          <>
            <img
              src={imgUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-black text-gray-600">
            {t("itemCard.noImage", "Nincs kép")}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-3 flex flex-col justify-between h-[255px]">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold shadow-sm">
              {t(`categories.${category}`, category)}
            </span>
            <span className="text-sm szellit-text">{date}</span>
          </div>

          <h3 className="text-lg font-semibold szellit-text">{title}</h3>
          <div
            className="text-sm szellit-text overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {description}
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-blue-500 font-extrabold text-2xl px-2 py-1 rounded-md inline-block">
              {price.toLocaleString("hu-HU", { minimumFractionDigits: 0 })} Ft
            </span>
            <div className="flex items-center gap-1 text-sm szellit-text">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          </div>
        </div>

        <hr className="my-2 szellit-br" />

        {/* Seller & Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
              {sellerProfilePic ? (
                <img
                  src={`${API_URL}/${sellerProfilePic}`}
                  alt={sellerName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <UserCircle2 className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <span
              onClick={(e) => {
                e.stopPropagation();
                console.log(`${lng}/profiles/${sellerId}`);
                navigate(`/${lng}/profiles/${sellerId}`); // <-- navigate to seller profile
              }}
              className="text-sm font-medium hover:text-blue-500 cursor-pointer"
            >
              {sellerName}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFavoriteClick}
              className={clsx(
                "transition-transform duration-200 hover:scale-110 hover:text-red-500",
                isFavorited && "text-red-500"
              )}
              aria-label={
                isFavorited ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={clsx("w-5 h-5", isFavorited && "fill-red-500")}
              />
            </button>
            <button
              className="text-gray-500 hover:text-blue-500 transition-transform duration-200 hover:scale-110"
              aria-label="Message seller"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
