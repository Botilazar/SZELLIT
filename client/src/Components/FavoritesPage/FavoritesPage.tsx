// client/src/Components/FavoritesPage/FavoritesPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import SearchBar from "../SearchBar/SearchBar";
import CategorySelector from "../CategorySelector/CategorySelector";
import FilterDropdown from "../FilterDropdown/FilterDropdown";
import ItemCard from "../ItemCard/ItemCard";
import Pagination from "../Pagination/Pagination";

type Item = {
  item_id: number;
  title: string;
  description: string;
  price: number;
  seller_city: string;
  seller_name: string;
  created_at: string;
  category_name: string;
  img_urls?: string[];
};

type FilterOptionKey =
  | "filters.newestUpload"
  | "filters.oldestUpload"
  | "filters.priceAsc"
  | "filters.priceDesc";

export default function FavoritesPage() {
  const { t, i18n } = useTranslation();

  const [items, setItems] = useState<Item[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Kereső + szűrők + rendezés
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] =
    useState<FilterOptionKey>("filters.newestUpload");

  // Lapozás
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Betöltés/hiba állapot
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // locale a dátumhoz
  const locale =
    i18n.language === "hu" ? "hu-HU" : i18n.language === "de" ? "de-DE" : "en-GB";

  // A11y: fókusz cél (skip linkhez)
  const headingId = "favorites-heading";
  const listId = "favorites-list";
  const mainRef = useRef<HTMLElement | null>(null);

  // Kedvencek lekérése (teljes adatok)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken") || "";
        const res = await fetch("http://localhost:5000/api/favorites/items", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (!res.ok) throw new Error(`Favorites items failed (${res.status})`);

        const rows: unknown = await res.json();
        if (!Array.isArray(rows)) throw new Error("Unexpected response");

        const favItems = rows as Item[];
        if (alive) {
          setItems(favItems);
          setFavoriteIds(favItems.map((r) => r.item_id));
        }
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Unknown error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Kedvenc váltás (optimista frissítés) – DELETE: /api/favorites/:itemId
  const handleToggleFavorite = async (itemId: number, isNowFavorited: boolean) => {
    setFavoriteIds((prev) =>
      isNowFavorited ? [...prev, itemId] : prev.filter((id) => id !== itemId)
    );

    const token = localStorage.getItem("accessToken") || "";
    try {
      if (isNowFavorited) {
        await fetch("http://localhost:5000/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ item_id: itemId }),
        });
      } else {
        await fetch(`http://localhost:5000/api/favorites/${itemId}`, {
          method: "DELETE",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        // azonnal tűnjön el a listából
        setItems((prev) => prev.filter((x) => x.item_id !== itemId));
      }
    } catch (e) {
      // opcionális rollback
      setFavoriteIds((prev) =>
        !isNowFavorited ? [...prev, itemId] : prev.filter((id) => id !== itemId)
      );
      console.error("Favorite toggle failed", e);
    }
  };

  // Keresés + kategória szűrés + rendezés (memózva)
  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = items.filter((item) => {
      const matchesSearch =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.seller_name.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "all" || item.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (selectedFilter) {
        case "filters.oldestUpload":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "filters.priceAsc":
          return a.price - b.price;
        case "filters.priceDesc":
          return b.price - a.price;
        default: // "filters.newestUpload"
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return sorted;
  }, [items, searchQuery, selectedCategory, selectedFilter]);

  // Ha szűrő változik, lapozás első oldalra
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedFilter]);

  // Lapozás szelet
  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredAndSorted.slice(start, start + itemsPerPage);

  // Állapot nézetek (ARIA live)
  if (loading)
    return (
      <div className="p-4" role="status" aria-live="polite" aria-busy="true">
        {t("favorites.loading")}
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-500" role="alert" aria-live="assertive">
        {t("favorites.error")}: {error}
      </div>
    );

  return (
    <>
      {/* Skip link a fő tartalomhoz */}
      <a
        href={`#${headingId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded"
      >
        {t("a11y.skipToContent", { defaultValue: "Ugrás a tartalomra" })}
      </a>

      <main
        ref={mainRef as any}
        role="main"
        aria-labelledby={headingId}
        className="szellit-background max-w-[1500px] mx-auto px-4 py-8 space-y-6 outline-none"
        tabIndex={-1}
      >
        {/* Oldalcím */}
        <h1 id={headingId} className="text-xl font-semibold mb-2">
          {t("favorites.title")}
        </h1>

        {/* Kereső */}
        <section aria-label={t("filters.placeholder", { defaultValue: "Mit keresel?" })}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </section>

        {/* Szűrők és rendezés */}
        <section
          className="flex flex-col md:flex-row justify-between items-start gap-4"
          aria-label={t("filters.section", { defaultValue: "Szűrők és rendezés" })}
        >
          <CategorySelector
            selected={selectedCategory}
            setSelected={setSelectedCategory}
          />
          <FilterDropdown
            selected={selectedFilter}
            setSelected={setSelectedFilter}
          />
        </section>

        {/* Lista */}
        {pageItems.length === 0 ? (
          <div
            className="text-sm text-gray-500"
            role="status"
            aria-live="polite"
          >
            {t("browsing.noResults")}
          </div>
        ) : (
          <div
            id={listId}
            role="list"
            aria-describedby={`${listId}-desc`}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <span id={`${listId}-desc`} className="sr-only">
              {t("a11y.resultsList", { defaultValue: "Kedvencek listája." })}
            </span>

            {pageItems.map((item) => (
              <div
                key={item.item_id}
                role="listitem"
                className="focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 rounded-lg"
                tabIndex={0}
                aria-label={`${item.title}, ${item.price} Ft`}
              >
                <ItemCard
                  category={item.category_name}
                  date={new Date(item.created_at).toLocaleDateString(locale)}
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
            ))}
          </div>
        )}

        {/* Lapozó */}
        <nav aria-label={t("a11y.pagination", { defaultValue: "Lapozás" })}>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage))}
            onPageChange={(p) => {
              setCurrentPage(p);
              // a11y: fókusz vissza a main-re lapozás után
              setTimeout(() => {
                mainRef.current?.focus?.();
              }, 0);
            }}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </nav>
      </main>
    </>
  );
}
