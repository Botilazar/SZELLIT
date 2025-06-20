import { useState } from "react";
import SearchBar from "../../Components/SearchBar/SearchBar";
import CategorySelector from "../../Components/CategorySelector/CategorySelector";
import FilterDropdown from "../../Components/FilterDropdown/FilterDropdown";
import ItemCard from "../../Components/ItemCard/ItemCard";

const BrowsingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Összes");
  const [selectedFilter, setSelectedFilter] = useState("Legújabb feltöltés");

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

      <div className="flex flex-wrap justify-center gap-4">
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
      </div>
    </div>
  );
};

export default BrowsingPage;
