"use client";

import {buildPageItems} from "./categoryListing";

export default function CategoryPagination({
    currentPage,
    totalPages,
    compact,
    loading,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    compact: boolean;
    loading: boolean;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    const pageItems = buildPageItems(currentPage, totalPages, compact);

    return (
        <nav className="category-products__pagination" aria-label="Пагинация категорий">
            <button
                type="button"
                className="category-products__page-btn category-products__page-btn--prev"
                disabled={loading || currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                {compact ? "‹" : "Назад"}
            </button>

            <div className="category-products__page-list" aria-label="Номера страниц">
                {pageItems.map((item) => {
                    if (typeof item !== "number") {
                        return (
                            <span key={item} className="category-products__page-dots" aria-hidden>
                                ...
                            </span>
                        );
                    }

                    const isActive = item === currentPage;
                    return (
                        <button
                            key={item}
                            type="button"
                            className={`category-products__page-number${isActive ? " category-products__page-number--active" : ""}`}
                            disabled={loading || isActive}
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => onPageChange(item)}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                className="category-products__page-btn category-products__page-btn--next"
                disabled={loading || currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                {compact ? "›" : "Вперед"}
            </button>
        </nav>
    );
}
