export interface ShortSpec {
    title: string;
    icon?: string | null;
    text?: string | null;
}

export interface Product {
    id: number;
    origin: number;
    title: string;
    output_price: number;
    preview?: string;
    pics?: string[];
    short_specs?: ShortSpec[];
}

export interface ProductsResponse {
    products: Product[];
    next_cursor: number | null;
    has_more: boolean;
}