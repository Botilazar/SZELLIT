import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "../../Components/SearchBar/SearchBar";
import CategorySelector from "../../Components/CategorySelector/CategorySelector";
import FilterDropdown from "../../Components/FilterDropdown/FilterDropdown";
import ItemCard from "../../Components/ItemCard/ItemCard";
import Pagination from "../Pagination/Pagination";

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
  user_id: number;
}

const BrowsingPage = () => {
  const { t } = useTranslation();

  // Use translated category keys or values consistent with CategorySelector usage
  const categoryAll = t("categories.all");
  const filterOptions = [
    t("filters.newestUpload"),
    t("filters.oldestUpload"),
    t("filters.priceAsc"),
    t("filters.priceDesc"),
  ];

  const [selectedCategory, setSelectedCategory] = useState(categoryAll);
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Debounce input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Reset to page 1 on itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

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

      // Note: category_name from API is untranslated, so compare with untranslated original keys or map accordingly
      const matchesCategory =
        selectedCategory === categoryAll || item.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    switch (selectedFilter) {
      case filterOptions[0]: // newest upload
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case filterOptions[1]: // oldest upload
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case filterOptions[2]: // price ascending
        result.sort((a, b) => a.price - b.price);
        break;
      case filterOptions[3]: // price descending
        result.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredItems(result);
    setCurrentPage(1);
  }, [debouncedQuery, selectedCategory, selectedFilter, allItems, categoryAll, filterOptions]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

  const handleToggleFavorite = (itemId: number, isNowFavorited: boolean) => {
    setFavoriteIds((prev) =>
      isNowFavorited ? [...prev, itemId] : prev.filter((id) => id !== itemId)
    );
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-8 space-y-6">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <CategorySelector selected={selectedCategory} setSelected={setSelectedCategory} />
        <FilterDropdown selected={selectedFilter} setSelected={setSelectedFilter} />
      </div>

      <div className="flex flex-wrap justify-center gap-4 p-4 rounded-xl">
        {itemsToDisplay.length === 0 ? (
          <p className="text-gray-500 text-center w-full">{t("browsing.noResults")}</p>
        ) : (
          itemsToDisplay.map((item) => (
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
                userId={item.user_id}
                isFavorited={favoriteIds.includes(item.item_id)}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default BrowsingPage;
