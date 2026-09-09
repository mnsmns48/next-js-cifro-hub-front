"use client";

import {CloseOutlined} from "@ant-design/icons";

import type {AppliedFilterChip} from "./categoryListing";

export default function CategoryAppliedFilterChips({
    chips,
    onRemove,
}: {
    chips: AppliedFilterChip[];
    onRemove: (filterKey: string, valueKey: string) => void;
}) {
    if (chips.length === 0) return null;

    return (
        <div className="category-products__applied" aria-label="Применённые фильтры">
            {chips.map((chip) => (
                <button
                    key={chip.id}
                    type="button"
                    className="category-products__applied-chip"
                    aria-label={`Убрать фильтр ${chip.label}`}
                    onClick={() => onRemove(chip.filterKey, chip.valueKey)}
                >
                    <span className="category-products__applied-chip-text">{chip.label}</span>
                    <CloseOutlined className="category-products__applied-chip-x" aria-hidden/>
                </button>
            ))}
        </div>
    );
}
