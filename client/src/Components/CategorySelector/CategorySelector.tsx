import { useTranslation } from "react-i18next";

type CategorySelectorProps = {
    selected: string;
    setSelected: (cat: string) => void;
};

const CategorySelector = ({ selected, setSelected }: CategorySelectorProps) => {
    const { t } = useTranslation();

    const categoryKeys = ["all", "book", "device", "apartment"];

    return (
        <div className="flex flex-wrap gap-3">
            {categoryKeys.map((key) => (
                <button
                    key={key}
                    onClick={() => setSelected(key)}
                    className={`px-6 py-2 rounded-full text-sm font-semibold 
                        ${selected === key
                            ? "bg-blue-600 text-white"
                            : "szellit-search"
                        }`}
                >
                    {t(`categories.${key}`)}
                </button>
            ))}
        </div>
    );
};

export default CategorySelector;
