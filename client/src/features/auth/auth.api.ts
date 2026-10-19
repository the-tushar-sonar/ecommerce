import { apiRequest } from "../../lib/api";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResult extends AuthTokens {
    user: AuthUser;
}

interface AuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export async function registerUser(input: {
    name: string;
    email: string;
    password: string;
}): Promise<AuthResult> {
    const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: input,
    });

    return response.data;
}

export async function loginUser(input: {
    email: string;
    password: string;
}): Promise<AuthResult> {
    const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: input,
    });

    return response.data;
}

export async function logoutUser(
    refreshToken: string,
    accessToken: string,
): Promise<void> {
    await apiRequest<unknown>("/auth/logout", {
        method: "POST",
        token: accessToken,
        body: { refreshToken },
    });
}