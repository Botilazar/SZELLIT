// src/Components/BrowsingPage/BrowsingPage.tsx

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

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

type FilterOptionKey =
  | "filters.newestUpload"
  | "filters.oldestUpload"
  | "filters.priceAsc"
  | "filters.priceDesc";

const BrowsingPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryAll = t("categories.all");

  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "8", 10);

  const [selectedCategory, setSelectedCategory] = useState(categoryAll);
  const [selectedFilter, setSelectedFilter] = useState<FilterOptionKey>("filters.newestUpload");
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);

  const isSyncingFromUrl = useRef(false);

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Sync state from URL parameters
  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "8", 10);

    if (pageParam !== currentPage || limitParam !== itemsPerPage) {
      isSyncingFromUrl.current = true;
      setCurrentPage(pageParam);
      setItemsPerPage(limitParam);
    }
  }, [searchParams]);

  // Sync URL from state (skip if just synced from URL)
  useEffect(() => {
    if (isSyncingFromUrl.current) {
      isSyncingFromUrl.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (
      params.get("page") !== searchParams.get("page") ||
      params.get("limit") !== searchParams.get("limit")
    ) {
      setSearchParams(params);
    }
  }, [currentPage, itemsPerPage]);

  // Reset page to 1 on items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Fetch items and favorites
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

  // Apply filters and sorting
  useEffect(() => {
    const q = debouncedQuery.toLowerCase();

    let result = allItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.seller_name.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === categoryAll || item.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    switch (selectedFilter) {
      case "filters.newestUpload":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "filters.oldestUpload":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "filters.priceAsc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "filters.priceDesc":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredItems(result);
    setCurrentPage(1); // reset to first page on filter/search change
  }, [debouncedQuery, selectedCategory, selectedFilter, allItems, categoryAll]);

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
