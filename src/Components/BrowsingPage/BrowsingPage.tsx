import "./BrowsingPage.css";
import { ItemCard } from "../../Components/ItemCard/ItemCard";

const BrowsingPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Browse Listings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        <ItemCard />
        {/* Add more ItemCards as needed for mock layout */}
      </div>
    </div>
  );
};

export default BrowsingPage;
