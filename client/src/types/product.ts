export interface Category {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    reservedStock: number;
    category: Category | string;
    imageUrl?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ProductListData {
    products: Product[];
    pagination: ProductPagination;
}

export interface ProductQuery {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?:
    | "newest"
    | "oldest"
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc";
    page?: number;
    limit?: number;
}