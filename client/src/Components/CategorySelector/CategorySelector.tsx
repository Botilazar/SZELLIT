// src/Components/CategorySelector/CategorySelector.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useDarkMode from "../../hooks/useDarkMode";

type CategorySelectorProps = {
    selected: string;
    setSelected: (cat: string) => void;

};

const CategorySelector = ({ selected, setSelected }: CategorySelectorProps) => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<string[]>([]);
    const { isDarkMode } = useDarkMode()

    // Fetch categories from backend on mount
    useEffect(() => {
        fetch("/api/categories")
            .then((res) => res.json())
            .then((data: string[]) => setCategories(["all", ...data]))
            .catch((err) => console.error("Failed to fetch categories:", err));
    }, []);

    return (
        <div className="flex flex-wrap gap-3">
            {categories.map((key) => {
                const isSelected = selected === key;
                const bgColor = isSelected
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                    : isDarkMode
                        ? "bg-gray-700 text-gray-200 hover:scale-105 hover:shadow-md"
                        : "bg-gray-200 text-gray-800 hover:scale-105 hover:shadow-md";

                return (
                    <button
                        key={key}
                        onClick={() => setSelected(key)}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform ${bgColor}`}
                    >
                        {t(`categories.${key}`)}
                    </button>
                );
            })}
        </div>
    );
};

export default CategorySelector;
