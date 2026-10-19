import { apiRequest } from "../../lib/api";
import type {
    Category,
    Product,
    ProductListData,
    ProductQuery,
} from "../../types/product";

export async function getProducts(
    query: ProductQuery = {},
): Promise<ProductListData> {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") {
            params.set(key, String(value));
        }
    }

    const queryString = params.toString();
    const path = queryString
        ? `/products?${queryString}`
        : "/products";

    const response = await apiRequest<ProductListData>(path);

    return response.data;
}

export async function getProductById(
    productId: string,
): Promise<Product> {
    const response = await apiRequest<Product>(
        `/products/${encodeURIComponent(productId)}`,
    );

    return response.data;
}

export async function getCategories(): Promise<Category[]> {
    const response = await apiRequest<Category[]>("/categories");

    return response.data;
}