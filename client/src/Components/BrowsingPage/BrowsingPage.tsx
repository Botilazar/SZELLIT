import { useState, useEffect } from "react";
import SearchBar from "../../Components/SearchBar/SearchBar";
import CategorySelector from "../../Components/CategorySelector/CategorySelector";
import FilterDropdown from "../../Components/FilterDropdown/FilterDropdown";
import ItemCard from "../../Components/ItemCard/ItemCard";

interface Item {
  item_id: number;
  title: string;
  description: string;
  price: number;
  created_at: string;
  category_name: string;
  seller_name: string;
  seller_city: string;
  img_url?: string;
}

const BrowsingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Összes");
  const [selectedFilter, setSelectedFilter] = useState("Legújabb feltöltés");
  const [items, setItems] = useState<Item[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/items")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setItems(data))
      .catch((err) => console.error("Fetch error:", err));

    fetch("http://localhost:5000/api/favorites")
      .then((res) => res.json())
      .then((ids) => setFavoriteIds(ids))
      .catch((err) => console.error("Favorite fetch error:", err));
  }, []);

  const handleToggleFavorite = (itemId: number, isNowFavorited: boolean) => {
    setFavoriteIds((prev) =>
      isNowFavorited ? [...prev, itemId] : prev.filter((id) => id !== itemId)
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 space-y-6">
      <SearchBar />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <CategorySelector
          selected={selectedCategory}
          setSelected={setSelectedCategory}
        />
        <FilterDropdown
          selected={selectedFilter}
          setSelected={setSelectedFilter}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4 p-4 rounded-xl">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center w-full">Nincs találat.</p>
        ) : (
          items.map((item) => (
            <div key={item.item_id}>
              <ItemCard
                category={item.category_name}
                date={new Date(item.created_at).toLocaleDateString("hu-HU")}
                title={item.title}
                description={item.description}
                price={item.price}
                location={item.seller_city}
                sellerName={item.seller_name}
                imgUrl={item.img_url}
                itemId={item.item_id}
                isFavorited={favoriteIds.includes(item.item_id)}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrowsingPage;
