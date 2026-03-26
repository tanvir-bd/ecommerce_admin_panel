const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const productEditApi = {
    async getById(id: number) {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        return response.json();
    },

    async update(id: number, formData: FormData) {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: "PATCH",
            body: formData,
        });
        if (!response.ok) throw new Error("Failed to update product");
        return response.json();
    },
};
