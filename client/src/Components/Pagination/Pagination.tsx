import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (count: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
}) => {
    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onItemsPerPageChange(Number(e.target.value));
    };

    return (
        <div className="flex justify-center items-center gap-4 mt-6 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-full szellit-search disabled:opacity-40"
                aria-label="Previous page"
            >
                ←
            </button>

            <span className="szellit-text">
                {currentPage} / {totalPages}
            </span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-full szellit-search  disabled:opacity-40"
                aria-label="Next page"
            >
                →
            </button>

            <select
                value={itemsPerPage}
                onChange={handlePerPageChange}
                className="ml-4 border szellit-background rounded px-2 py-1"
                aria-label="Items per page"
            >
                {[4, 8, 12, 16, 24, 32].map((count) => (
                    <option key={count} value={count}>
                        {count}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Pagination;
