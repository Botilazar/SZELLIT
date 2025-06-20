type CategorySelectorProps = {
    selected: string;
    setSelected: (cat: string) => void;
};

const categories = ["Összes", "Könyv", "Eszköz", "Lakás"];

const CategorySelector = ({ selected, setSelected }: CategorySelectorProps) => {
    return (
        <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setSelected(cat)}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all
            ${selected === cat
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategorySelector;
