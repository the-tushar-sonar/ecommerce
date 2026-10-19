import { apiRequest } from "../../lib/api";
import type { Product } from "../../types/product";

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    createdAt?: string;
    updatedAt?: string;
}

export async function getCart(token: string): Promise<Cart> {
    const response = await apiRequest<Cart>("/cart", { token });
    return response.data;
}

export async function addToCart(
    token: string,
    productId: string,
    quantity = 1,
): Promise<Cart> {
    const response = await apiRequest<Cart>("/cart", {
        method: "POST",
        token,
        body: { productId, quantity },
    });

    return response.data;
}

export async function updateCartItem(
    token: string,
    productId: string,
    quantity: number,
): Promise<Cart> {
    const response = await apiRequest<Cart>(
        `/cart/${encodeURIComponent(productId)}`,
        {
            method: "PATCH",
            token,
            body: { quantity },
        },
    );

    return response.data;
}

export async function removeCartItem(
    token: string,
    productId: string,
): Promise<Cart> {
    const response = await apiRequest<Cart>(
        `/cart/${encodeURIComponent(productId)}`,
        {
            method: "DELETE",
            token,
        },
    );

    return response.data;
}

export async function clearCart(token: string): Promise<Cart> {
    const response = await apiRequest<Cart>("/cart", {
        method: "DELETE",
        token,
    });

    return response.data;
}