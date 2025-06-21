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
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Fetch data
  useEffect(() => {
    fetch("http://localhost:5000/api/items")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => {
        setAllItems(data);
      })
      .catch((err) => console.error("Items fetch error:", err));

    fetch("http://localhost:5000/api/favorites")
      .then((res) => res.json())
      .then((ids) => setFavoriteIds(ids))
      .catch((err) => console.error("Favorites fetch error:", err));
  }, []);

  // Filter & sort logic
  useEffect(() => {
    const q = debouncedQuery.toLowerCase();

    let result = allItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.seller_name.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "Összes" || item.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sorting logic
    switch (selectedFilter) {
      case "Legújabb feltöltés":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "Legrégebbi feltöltés":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "Ár szerint növekvő":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Ár szerint csökkenő":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredItems(result);
  }, [debouncedQuery, selectedCategory, selectedFilter, allItems]);

  const handleToggleFavorite = (itemId: number, isNowFavorited: boolean) => {
    setFavoriteIds((prev) =>
      isNowFavorited ? [...prev, itemId] : prev.filter((id) => id !== itemId)
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 space-y-6">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 text-center w-full">Nincs találat.</p>
        ) : (
          filteredItems.map((item) => (
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
