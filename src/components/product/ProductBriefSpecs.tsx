"use client";

import {formatSpecValue, type SpecRow} from "./productDetail";

export default function ProductBriefSpecs({
    rows,
    showAllSpecs,
}: {
    rows: SpecRow[];
    showAllSpecs: boolean;
}) {
    return (
        <>
            {rows.length > 0 ? (
                <dl className="product-detail__brief">
                    {rows.map((row) => (
                        <div key={row.param} className="product-detail__brief-row">
                            <dt>{row.param}</dt>
                            <dd>{formatSpecValue(row.param, row.value)}</dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <p className="product-detail__specs-empty">Краткие характеристики появятся позже</p>
            )}
            {showAllSpecs && (
                <button
                    type="button"
                    className="product-detail__all-specs"
                    onClick={() => {
                        document.getElementById("product-specs")?.scrollIntoView({behavior: "smooth"});
                    }}
                >
                    Все характеристики
                </button>
            )}
        </>
    );
}
