import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
    const { t } = useTranslation();

    return (
        <div className="w-full flex items-center bg-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="text-gray-500 mr-3 w-5 h-5" />
            <input
                type="text"
                placeholder={t("search.placeholder")}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent outline-none placeholder-gray-400 text-base"
            />
        </div>
    );
};

export default SearchBar;
