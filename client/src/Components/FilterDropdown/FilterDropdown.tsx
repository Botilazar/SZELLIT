import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import useDarkMode from "../../hooks/useDarkMode";

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
    const { isDarkMode } = useDarkMode()

    const filterKeys: FilterOptionKey[] = [
        "filters.newestUpload",
        "filters.oldestUpload",
        "filters.priceAsc",
        "filters.priceDesc",
    ];

    // Close dropdown when clicking outside
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
            {/* Button */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className={`szellit-search
          flex items-center gap-2 px-5 py-2 rounded-full font-semibold
          transition-all duration-300
          
          shadow-sm hover:shadow-md active:scale-95
        `}
            >
                {t(selected)}
                <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown menu */}
            {open && (
                <div
                    className={`szellit-search
            absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-10 overflow-hidden
            transition-all duration-300
            
          `}
                >
                    {filterKeys.map((key) => {
                        const isSelected = key === selected;
                        return (
                            <div
                                key={key}
                                onClick={() => {
                                    setSelected(key);
                                    setOpen(false);
                                }}
                                className={`
                  cursor-pointer px-4 py-2 text-sm transition-all duration-200
                  ${isSelected
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md"
                                        : isDarkMode
                                            ? "hover:bg-gray-700"
                                            : "hover:bg-gray-100"
                                    }
                  rounded-md m-1
                `}
                            >
                                {t(key)}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
