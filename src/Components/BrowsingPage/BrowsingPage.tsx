import "./BrowsingPage.css";
import ItemCard from "../../Components/ItemCard/ItemCard";

const BrowsingPage = () => {
  return (
    <div className="max-w-full mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-center gap-4 max-w-[1440px] mx-auto">
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