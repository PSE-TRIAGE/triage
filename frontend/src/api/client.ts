import {z} from "zod";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export interface ApiErrorResponse {
    detail?: string;
    [key: string]: unknown;
}

export class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public data?: ApiErrorResponse,
    ) {
        super(`API Error: ${status} ${statusText}`);
        this.name = "ApiError";
    }
}

class ApiClient {
    constructor(private baseUrl: string) {}

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem("auth_token");
        return {
            ...(token && {Authorization: `Bearer ${token}`}),
        };
    }

    private async handleResponse<T>(
        response: Response,
        schema: z.ZodSchema<T>,
    ): Promise<T> {
        if (!response.ok) {
            let errorData: ApiErrorResponse | undefined;
            try {
                const data = await response.json();
                errorData = data as ApiErrorResponse;
            } catch {
                const text = await response.text();
                errorData = {detail: text};
            }

            if (response.status === 401) {
                localStorage.removeItem("auth_token");
                if (!window.location.pathname.includes("/login")) {
                    window.location.href = "/login";
                }
            }

            throw new ApiError(response.status, response.statusText, errorData);
        }

        // Handle empty responses (204 No Content, etc.)
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return undefined as T;
        }

        const data = await response.json();
        return schema.parse(data ?? undefined);
    }

    private async handleBlobResponse(response: Response): Promise<Blob> {
        if (!response.ok) {
            let errorData: ApiErrorResponse | undefined;
            try {
                const data = await response.json();
                errorData = data as ApiErrorResponse;
            } catch {
                const text = await response.text();
                errorData = {detail: text};
            }

            if (response.status === 401) {
                localStorage.removeItem("auth_token");
                window.location.href = "/login";
            }

            throw new ApiError(response.status, response.statusText, errorData);
        }

        return response.blob();
    }

    async get<T>(endpoint: string, schema: z.ZodSchema<T>): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeaders(),
            },
            credentials: "include",
        });
        return this.handleResponse<T>(response, schema);
    }

    async post<T>(
        endpoint: string,
        schema: z.ZodSchema<T>,
        data?: unknown,
    ): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeaders(),
            },
            credentials: "include",
            body: data ? JSON.stringify(data) : undefined,
        });
        return this.handleResponse<T>(response, schema);
    }

    async put<T>(
        endpoint: string,
        schema: z.ZodSchema<T>,
        data?: unknown,
    ): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeaders(),
            },
            credentials: "include",
            body: data ? JSON.stringify(data) : undefined,
        });
        return this.handleResponse<T>(response, schema);
    }

    async patch<T>(
        endpoint: string,
        schema: z.ZodSchema<T>,
        data?: unknown,
    ): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeaders(),
            },
            credentials: "include",
            body: data ? JSON.stringify(data) : undefined,
        });
        return this.handleResponse<T>(response, schema);
    }

    async delete<T>(endpoint: string, schema: z.ZodSchema<T>): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeaders(),
            },
            credentials: "include",
        });
        return this.handleResponse<T>(response, schema);
    }

    async uploadFile<T>(
        endpoint: string,
        schema: z.ZodSchema<T>,
        file: File,
        additionalData?: Record<string, string>,
        method: "POST" | "PUT" = "POST",
    ): Promise<T> {
        const formData = new FormData();
        formData.append("file", file);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: {
                ...this.getAuthHeaders(),
            },
            credentials: "include",
            body: formData,
        });
        return this.handleResponse<T>(response, schema);
    }

    async downloadFile(endpoint: string): Promise<Blob> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "GET",
            headers: {
                ...this.getAuthHeaders(),
            },
            credentials: "include",
        });
        return this.handleBlobResponse(response);
    }

    async downloadFileWithName(
        endpoint: string,
        filename: string,
    ): Promise<void> {
        const blob = await this.downloadFile(endpoint);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

// TODO(liam): don't use singleton but pass somewhere
export const apiClient = new ApiClient(API_BASE_URL);
