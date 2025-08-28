import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import SearchBar from "../../Components/SearchBar/SearchBar";
import CategorySelector from "../../Components/CategorySelector/CategorySelector";
import FilterDropdown from "../../Components/FilterDropdown/FilterDropdown";
import ItemCard from "../../Components/ItemCard/ItemCard";
import Pagination from "../Pagination/Pagination";
import useDarkMode from "../../hooks/useDarkMode";
import { useAuth } from "../../AuthContext";

interface Item {
  item_id: number;
  title: string;
  description: string;
  price: number;
  created_at: string;
  category_name: string;
  seller_name: string;
  seller_city: string;
  img_urls?: string[];
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();

  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "8", 10);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFilter, setSelectedFilter] =
    useState<FilterOptionKey>("filters.newestUpload");
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
    const timeout = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Sync state from URL
  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "8", 10);
    if (pageParam !== currentPage || limitParam !== itemsPerPage) {
      isSyncingFromUrl.current = true;
      setCurrentPage(pageParam);
      setItemsPerPage(limitParam);
    }
  }, [searchParams]);

  // Sync URL from state
  useEffect(() => {
    if (isSyncingFromUrl.current) {
      isSyncingFromUrl.current = false;
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    setSearchParams(params);
  }, [currentPage, itemsPerPage]);

  // Reset page on itemsPerPage change
  useEffect(() => setCurrentPage(1), [itemsPerPage]);

  // Fetch items and favorites
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const itemsRes = await fetch("http://localhost:5000/api/items");
        if (!itemsRes.ok) throw new Error(`Items fetch failed (${itemsRes.status})`);
        const itemsData = await itemsRes.json();
        if (alive) setAllItems(itemsData as Item[]);

        const token = localStorage.getItem("accessToken") || "";
        const favRes = await fetch("http://localhost:5000/api/favourites", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (!favRes.ok) throw new Error(`Favorites fetch failed (${favRes.status})`);
        const favData = await favRes.json();
        if (alive && Array.isArray(favData)) setFavoriteIds(favData as number[]);
      } catch (e: any) {
        console.error("Fetch error:", e?.message ?? e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    const q = debouncedQuery.toLowerCase();
    const result = allItems.filter(
      (item) =>
        (item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.seller_name.toLowerCase().includes(q)) &&
        (selectedCategory === "all" || item.category_name === selectedCategory)
    );

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
    setCurrentPage(1);
  }, [debouncedQuery, selectedCategory, selectedFilter, allItems]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

  // Favorite handler with login check
  const handleToggleFavorite = async (itemId: number, isNowFavorited: boolean) => {
    if (!isAuthenticated) {
      toast.error("You must log in to favorite items!");
      return;
    }

    const url = "http://localhost:5000/api/favourites";
    const method = isNowFavorited ? "POST" : "DELETE";
    const token = localStorage.getItem("accessToken") || "";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ item_id: itemId }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      setFavoriteIds((prev) =>
        isNowFavorited ? [...prev, itemId] : prev.filter((id) => id !== itemId)
      );
    } catch (err) {
      console.error(err);
      toast.error("You have to log in to do this!");
    }
  };

  const handleCardClick = (item: Item) => navigate(`${item.item_id}`);

  return (
    <div className="szellit-background max-w-[1500px] mx-auto px-4 py-8 space-y-6">
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
        {itemsToDisplay.length === 0 ? (
          <p className="text-gray-500 text-center w-full">{t("browsing.noResults")}</p>
        ) : (
          itemsToDisplay.map((item) => (
            <div key={item.item_id} onClick={() => handleCardClick(item)}>
              <ItemCard
                category={t(`categories.${item.category_name}`)}
                date={new Date(item.created_at).toLocaleDateString("hu-HU")}
                title={item.title}
                description={item.description}
                price={item.price}
                location={item.seller_city}
                sellerName={item.seller_name}
                imgUrl={item.img_urls?.[0] ?? undefined}
                itemId={item.item_id}
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
