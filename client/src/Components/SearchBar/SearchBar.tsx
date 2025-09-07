import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
    const { t } = useTranslation();

    return (
        <div className="szellit-search-input w-full flex items-center  rounded-xl px-4 py-3 ">
            <Search className="text-gray-500 mr-3 w-5 h-5" />
            <input
                type="text"
                placeholder={t("filters.placeholder")}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent outline-none placeholder-gray-400 text-base"
            />
        </div>
    );
};

export default SearchBar;
