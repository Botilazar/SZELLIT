import { useEffect, useState } from "react";
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

export default function FavoritesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    // Teljes kedvenc lista:
    fetch("http://localhost:5000/api/favorites/items")
      .then(r => r.json())
      .then((rows: Item[]) => {
        setItems(rows);
        setFavoriteIds(rows.map(r => r.item_id)); // mind kedvenc
      })
      .catch(console.error);
  }, []);


  const handleToggleFavorite = (itemId: number, isNowFavorited: boolean) => {
    setFavoriteIds(prev =>
      isNowFavorited ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
    fetch("http://localhost:5000/api/favorites", {
      method: isNowFavorited ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId })
    }).catch(console.error);
    // Ha töröljük a kedvencekből, opcionálisan azonnal el is tüntethetjük a listából:
    if (!isNowFavorited) setItems(prev => prev.filter(x => x.item_id !== itemId));
  };

  // Egyszerű lapozás (ugyanaz a logika, mint a BrowsingPage-ben)
  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = items.slice(start, start + itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Kedvencek</h1>

      {pageItems.length === 0 ? (
        <div className="text-sm text-gray-500">Nincs kedvenc hirdetés.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageItems.map(item => (
            <div key={item.item_id}>
              <ItemCard
                category={item.category_name}
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
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(items.length / itemsPerPage))}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
