import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

type FilterDropdownProps = {
    selected: string;
    setSelected: (f: string) => void;
};

const FilterDropdown = ({ selected, setSelected }: FilterDropdownProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filters = [
        t("filters.newestUpload"),
        t("filters.oldestUpload"),
        t("filters.priceAscending"),
        t("filters.priceDescending"),
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
                {selected}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10">
                    {filters.map((option) => (
                        <div
                            key={option}
                            onClick={() => {
                                setSelected(option);
                                setOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
