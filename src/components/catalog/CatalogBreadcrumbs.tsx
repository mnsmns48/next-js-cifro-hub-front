import Link from "next/link";

import {catalogCrumbHrefs} from "./catalogHref";

import "../css/CatalogBreadcrumbs.css";

export interface CatalogBreadcrumbItem {
    key: string;
    label: string;
    slug?: string | null;
    parent_id?: number | null;
}

export default function CatalogBreadcrumbs({
    items,
    currentLast = false,
}: {
    items: CatalogBreadcrumbItem[];
    currentLast?: boolean;
}) {
    if (items.length === 0) return null;

    const hrefs = catalogCrumbHrefs(items);

    return (
        <nav className="catalog-breadcrumbs" aria-label="Навигация">
            {items.map((item, index) => {
                const isCurrent = currentLast && index === items.length - 1;

                return (
                    <span key={item.key}>
                        {index > 0 ? <span className="catalog-breadcrumbs__sep">›</span> : null}
                        {isCurrent ? (
                            <span>{item.label}</span>
                        ) : (
                            <Link href={hrefs[index] ?? "/catalog"}>{item.label}</Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
