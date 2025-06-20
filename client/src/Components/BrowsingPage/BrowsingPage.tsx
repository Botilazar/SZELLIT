import { useState, useEffect } from "react";
import SearchBar from "../../Components/SearchBar/SearchBar";
import CategorySelector from "../../Components/CategorySelector/CategorySelector";
import FilterDropdown from "../../Components/FilterDropdown/FilterDropdown";
import ItemCard from "../../Components/ItemCard/ItemCard";

// ✅ Interface for item from backend
interface Item {
  item_id: number;
  title: string;
  description: string;
  price: number;
  created_at: string;
  category_name: string;
  seller_name: string;
  seller_city: string;
}

const BrowsingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Összes");
  const [selectedFilter, setSelectedFilter] = useState("Legújabb feltöltés");
  const [items, setItems] = useState<Item[]>([]); // typed

  useEffect(() => {
  fetch("http://localhost:5000/api/items")
    .then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then((data) => {
      console.log("Fetched items:", data);
      setItems(data);
    })
    .catch((err) => console.error("Fetch error:", err));
}, []);
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
            <div
              key={item.item_id}
              
            >
              
              <ItemCard
                category={item.category_name}
                date={new Date(item.created_at).toLocaleDateString("hu-HU")}
                title={item.title}
                description={item.description}
                price={item.price}
                location={item.seller_city}
                sellerName={item.seller_name}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrowsingPage;
