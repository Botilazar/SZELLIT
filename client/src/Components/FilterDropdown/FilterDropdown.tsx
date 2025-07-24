// src/Components/FilterDropdown/FilterDropdown.tsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

type FilterOptionKey =
    | "filters.newestUpload"
    | "filters.oldestUpload"
    | "filters.priceAsc"
    | "filters.priceDesc";

type FilterDropdownProps = {
    selected: FilterOptionKey;
    setSelected: (f: FilterOptionKey) => void;
};

const FilterDropdown = ({ selected, setSelected }: FilterDropdownProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filterKeys: FilterOptionKey[] = [
        "filters.newestUpload",
        "filters.oldestUpload",
        "filters.priceAsc",
        "filters.priceDesc",
    ];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center px-5 py-2 bg-gray-100 rounded-full font-semibold text-gray-700 hover:bg-gray-200"
            >
                <ChevronDown className="mr-2 w-4 h-4" />
                {t(selected)}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10">
                    {filterKeys.map((key) => (
                        <div
                            key={key}
                            onClick={() => {
                                setSelected(key);
                                setOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            {t(key)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
