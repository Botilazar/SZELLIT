
import "./ItemCard.css";
import { Heart, MessageCircle, MapPin } from 'lucide-react';

export function ItemCard() {
  return (
    <div className="w-[411px] h-[518px] bg-white rounded-[15px] shadow-[1px_11px_22.3px_-10px_rgba(0,0,0,0.25)] p-4 flex flex-col justify-between">
      {/* Image section */}
      <div className="w-full h-[225px] bg-gray-300 rounded-t-[15px] flex items-center justify-center text-black font-black text-4xl">
        KÉP
      </div>

      {/* Category and date */}
      <div className="flex justify-between items-center mt-3">
        <div className="bg-blue-100 text-blue-800 font-semibold text-xs px-3 py-1 rounded-full">
          Kategória
        </div>
        <span className="text-sm text-gray-500">2024.06.18</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-black mt-2">Termék neve</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-1">
        Termék leírása. Termék leírása.Termék leírása. Termék leírása...
      </p>

      {/* Price & Location */}
      <div className="flex justify-between items-center mt-3">
        <span className="text-blue-600 font-extrabold text-3xl">12 000 Ft</span>
        <div className="flex items-center text-sm text-gray-500">
          <MapPin size={16} className="mr-1" />
          Debrecen
        </div>
      </div>

      {/* Separator */}
      <hr className="my-3 border-gray-300" />

      {/* Seller & Actions */}
      <div className="flex justify-between items-center">
        {/* Seller */}
        <div className="flex items-center">
          <div className="w-[42px] h-[42px] bg-gray-200 rounded-full mr-2"></div>
          <span className="text-sm font-semibold text-black">Eladó neve</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button className="w-[43px] h-[43px] rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <Heart size={20} />
          </button>
          <button className="w-[43px] h-[43px] rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <MessageCircle size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}