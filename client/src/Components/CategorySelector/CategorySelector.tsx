import { useTranslation } from "react-i18next";

type CategorySelectorProps = {
    selected: string;
    setSelected: (cat: string) => void;
};

const CategorySelector = ({ selected, setSelected }: CategorySelectorProps) => {
    const { t } = useTranslation();

    const categories = [
        t("categories.all"),
        t("categories.book"),
        t("categories.device"),
        t("categories.apartment"),
    ];

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
