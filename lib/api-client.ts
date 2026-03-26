const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers = { ...options.headers } as Record<string, string>;

        // Add Authorization header if in browser and cookie exists
        if (typeof window !== 'undefined') {
            const getCookie = (name: string) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop()?.split(';').shift();
            }
            const session = getCookie('admin_session');
            if (session) {
                try {
                    const parsed = JSON.parse(decodeURIComponent(session));
                    if (parsed.access_token) {
                        headers['Authorization'] = `Bearer ${parsed.access_token}`;
                    }
                } catch (e) {
                    console.error('Failed to parse session cookie for token', e);
                }
            }
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get(endpoint: string): Promise<any> {
        return this.request(endpoint, {
            method: 'GET',
        });
    }

    async post(endpoint: string, data: any): Promise<any> {
        if (data instanceof FormData) {
            return this.request(endpoint, {
                method: 'POST',
                body: data,
            });
        }

        return this.request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    async put(endpoint: string, data: any): Promise<any> {
        if (data instanceof FormData) {
            return this.request(endpoint, {
                method: 'PUT',
                body: data,
            });
        }

        return this.request(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    async patch(endpoint: string, data: any): Promise<any> {
        if (data instanceof FormData) {
            return this.request(endpoint, {
                method: 'PATCH',
                body: data,
            });
        }

        return this.request(endpoint, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint: string): Promise<any> {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);

// API endpoints
export const categoriesApi = {
    getAll: () => apiClient.get('/categories'),
    getOne: (id: number) => apiClient.get(`/categories/${id}`),
    create: (formData: FormData) => apiClient.post('/categories', formData),
    update: (id: number, formData: FormData) => apiClient.patch(`/categories/${id}`, formData),
    delete: (id: number) => apiClient.delete(`/categories/${id}`),
};

export const subcategoriesApi = {
    getAll: (categoryId?: number) =>
        apiClient.get(`/subcategories${categoryId ? `?categoryId=${categoryId}` : ''}`),
    getOne: (id: number) => apiClient.get(`/subcategories/${id}`),
    create: (formData: FormData) => apiClient.post('/subcategories', formData),
    update: (id: number, formData: FormData) => apiClient.patch(`/subcategories/${id}`, formData),
    delete: (id: number) => apiClient.delete(`/subcategories/${id}`),
};

export const productsApi = {
    getAll: () => apiClient.get('/products'),
    getOne: (id: number) => apiClient.get(`/products/${id}`),
    create: (formData: FormData) => apiClient.post('/products', formData),
    update: (id: number, formData: FormData) => apiClient.patch(`/products/${id}`, formData),
    updateFeatured: (id: number, featured: boolean) =>
        apiClient.patch(`/products/${id}/featured`, { featured }),
    delete: (id: number) => apiClient.delete(`/products/${id}`),
};

export const analyticsApi = {
    getDashboardStats: () => apiClient.get('/analytics/dashboard'),
    getOrdersAnalytics: () => apiClient.get('/analytics/orders'),
    getCustomersAnalytics: () => apiClient.get('/analytics/customers'),
    getProductAnalytics: (id: number) => apiClient.get(`/analytics/products/${id}`),
    getRecentOrders: () => apiClient.get('/analytics/recent-orders'),
    getRecentCustomers: () => apiClient.get('/analytics/recent-customers'),
    getTopProducts: () => apiClient.get('/analytics/top-products'),
};

export const customersApi = {
    getAll: () => apiClient.get('/users?role=user'),
    getOne: (id: number) => apiClient.get(`/users/${id}`),
    delete: (id: number) => apiClient.delete(`/users/${id}`),
};

export const adminsApi = {
    getAll: (params?: { search?: string; role?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.role) queryParams.append('role', params.role);
        return apiClient.get(`/users?${queryParams.toString()}`);
    },
    create: (data: any) => apiClient.post('/users/admin', data),
    update: (id: number, data: any) => apiClient.put(`/users/admin/${id}`, data),
    delete: (id: number) => apiClient.delete(`/users/${id}`),
};

export const ordersApi = {
    getAll: (filters?: {
        dateRange?: string;
        paymentStatus?: string;
        paymentMethod?: string;
        searchQuery?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters?.dateRange) params.append('dateRange', filters.dateRange);
        if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
        if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
        if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);

        const queryString = params.toString();
        return apiClient.get(`/orders${queryString ? `?${queryString}` : ''}`);
    },
    getOne: (id: number) => apiClient.get(`/orders/${id}`),
    updateStatus: (id: number, orderStatus: string) =>
        apiClient.patch(`/orders/${id}/status`, { orderStatus }),
};

export const offersApi = {
    getAll: () => apiClient.get('/offers'),
    create: (formData: FormData) => apiClient.post('/offers', formData),
    delete: (id: number) => apiClient.delete(`/offers/${id}`),
};

export const websiteBannersApi = {
    getAll: () => apiClient.get('/website-banners'),
    create: (formData: FormData) => apiClient.post('/website-banners', formData),
    delete: (id: number) => apiClient.delete(`/website-banners/${id}`),
};

export const appBannersApi = {
    getAll: () => apiClient.get('/app-banners'),
    create: (formData: FormData) => apiClient.post('/app-banners', formData),
    delete: (id: number) => apiClient.delete(`/app-banners/${id}`),
};

export const couponsApi = {
    getAll: () => apiClient.get('/coupons'),
    getOne: (id: number) => apiClient.get(`/coupons/${id}`),
    create: (data: {
        code: string;
        discountPercent: number;
        validFrom: string;
        validUntil: string;
    }) => apiClient.post('/coupons', data),
    update: (id: number, data: {
        code?: string;
        discountPercent?: number;
        validFrom?: string;
        validUntil?: string;
        isActive?: boolean;
    }) => apiClient.patch(`/coupons/${id}`, data),
    delete: (id: number) => apiClient.delete(`/coupons/${id}`),
};

export const topbarsApi = {
    getAll: () => apiClient.get('/topbars'),
    getOne: (id: number) => apiClient.get(`/topbars/${id}`),
    create: (data: {
        title: string;
        textColor: string;
        backgroundColor: string;
        link: string;
        hasButton: boolean;
        buttonText?: string;
        buttonTextColor?: string;
        buttonBackgroundColor?: string;
        buttonLink?: string;
        isActive: boolean;
    }) => apiClient.post('/topbars', data),
    update: (id: number, data: {
        title?: string;
        textColor?: string;
        backgroundColor?: string;
        link?: string;
        hasButton?: boolean;
        buttonText?: string;
        buttonTextColor?: string;
        buttonBackgroundColor?: string;
        buttonLink?: string;
        isActive?: boolean;
    }) => apiClient.patch(`/topbars/${id}`, data),
    delete: (id: number) => apiClient.delete(`/topbars/${id}`),
};

export const reviewsApi = {
    getAll: () => apiClient.get('/reviews/admin'),
    approve: (id: number) => apiClient.patch(`/reviews/${id}/approve`, {}),
    deactivate: (id: number) => apiClient.patch(`/reviews/${id}/deactivate`, {}),
    reject: (id: number) => apiClient.patch(`/reviews/${id}/reject`, {}),
};

export const authApi = {
    login: (data: { email: string; password?: string }) => apiClient.post('/auth/login', data),
    sendOtp: (data: { email: string; username: string }) => apiClient.post('/auth/send-otp', data),
    verifyOtp: (data: { email: string; otp: string }) => apiClient.post('/auth/verify-otp', data),
};
