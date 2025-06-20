import "./ItemCard.css";
import { MapPin, Heart, MessageCircle, UserCircle2 } from "lucide-react";

const ItemCard = () => {
  return (
    <div className="relative w-[340px] h-[470px] bg-white shadow-lg rounded-[15px] p-4 overflow-hidden">
      {/* Image */}
      <div className="absolute top-0 left-0 right-0 h-[225px] bg-gray-300 rounded-t-[15px] flex items-center justify-center text-3xl font-black">
        KÉP
      </div>

      {/* Content with top margin to push below image */}
      <div className="mt-[225px] pb-5">
        {/* Category and Date */}
        <div className="mt-4 flex justify-between items-center">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
            Kategória
          </div>
          <div className="text-sm text-gray-500">2024.06.18</div>
        </div>

        {/* Title */}
        <div className="mt-2 font-semibold text-lg">Termék neve</div>

        {/* Description */}
        <div className="text-sm text-gray-600 line-clamp-2">
          Termék leírása. Termék leírása.Termék leírása. Termék leírása. Termék leírása.
        </div>

        {/* Price + Location */}
        <div className="mt-2 flex justify-between items-center">
          <div className="text-blue-600 font-extrabold text-2xl">12 000 Ft</div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            Debrecen
          </div>
        </div>

        {/* Divider */}
        <hr className="my-4 border-gray-300" />

        {/* Seller and icons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <UserCircle2 className="w-6 h-6 text-gray-500" />
            </div>
            <span className="text-sm font-medium">Eladó neve</span>
          </div>
          <div className="flex gap-3">
            <button className="text-gray-500 hover:text-red-500">
              <Heart className="w-5 h-5" />
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