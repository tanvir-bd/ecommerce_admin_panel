"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Plus, Upload } from "lucide-react";
import { QuillEditor } from "@/components/editor/quill-editor";
import { categoriesApi, subcategoriesApi, productsApi } from "@/lib/api-client";

interface ProductSize {
    id: string;
    size: string;
    quantity: number;
    price: number;
}

interface ProductImage {
    id: string;
    url: string;
    file?: File;
    isExisting?: boolean;
}

interface ProductBenefit {
    id: string;
    text: string;
}

interface ProductIngredient {
    id: string;
    text: string;
}

interface Category {
    id: number;
    name: string;
}

interface Subcategory {
    id: number;
    name: string;
    categoryId: number;
}

export default function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
    const router = useRouter();
    const { productId } = use(params);

    // Basic product information
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [brand, setBrand] = useState("");
    const [sku, setSku] = useState("");
    const [discount, setDiscount] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subcategoryId, setSubcategoryId] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [longDescription, setLongDescription] = useState("");

    // Arrays for multiple items
    const [sizes, setSizes] = useState<ProductSize[]>([]);
    const [benefits, setBenefits] = useState<ProductBenefit[]>([]);
    const [ingredients, setIngredients] = useState<ProductIngredient[]>([]);
    const [images, setImages] = useState<ProductImage[]>([]);

    // Temporary states for new items
    const [newBenefit, setNewBenefit] = useState("");
    const [newIngredient, setNewIngredient] = useState("");

    // Categories and subcategories from backend
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        fetchProductData();
        fetchCategories();
        fetchSubcategories();
    }, [productId]);

    useEffect(() => {
        if (categoryId) {
            const filtered = subcategories.filter(
                (sub) => sub.categoryId === parseInt(categoryId)
            );
            setFilteredSubcategories(filtered);
            if (subcategoryId && !filtered.find(s => s.id === parseInt(subcategoryId))) {
                setSubcategoryId("");
            }
        } else {
            setFilteredSubcategories([]);
            setSubcategoryId("");
        }
    }, [categoryId, subcategories]);

    const fetchProductData = async () => {
        try {
            setIsFetching(true);
            const product = await productsApi.getOne(parseInt(productId));

            // Populate basic fields
            setTitle(product.title || "");
            setDescription(product.description || "");
            setBrand(product.brand || "");
            setSku(product.sku || "");
            setDiscount(product.discount ? product.discount.toString() : "");
            setCategoryId(product.categoryId ? product.categoryId.toString() : "");
            setSubcategoryId(product.subcategoryId ? product.subcategoryId.toString() : "");
            setIsFeatured(product.featured || false);
            setLongDescription(product.longDescription || "");

            // Populate sizes
            if (product.sizes && product.sizes.length > 0) {
                setSizes(product.sizes.map((size: any) => ({
                    id: size.id.toString(),
                    size: size.size,
                    quantity: size.quantity,
                    price: parseFloat(size.price),
                })));
            }

            // Populate images (existing images from server)
            if (product.images && product.images.length > 0) {
                setImages(product.images.map((img: any) => ({
                    id: img.id.toString(),
                    url: `${process.env.NEXT_PUBLIC_API_URL}${img.url}`,
                    isExisting: true,
                })));
            }

            // Populate benefits
            if (product.benefits && product.benefits.length > 0) {
                setBenefits(product.benefits.map((benefit: any) => ({
                    id: benefit.id.toString(),
                    text: benefit.text,
                })));
            }

            // Populate ingredients
            if (product.ingredients && product.ingredients.length > 0) {
                setIngredients(product.ingredients.map((ingredient: any) => ({
                    id: ingredient.id.toString(),
                    text: ingredient.text,
                })));
            }
        } catch (error) {
            console.error("Failed to fetch product:", error);
            alert("Failed to load product data");
        } finally {
            setIsFetching(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoriesApi.getAll();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const fetchSubcategories = async () => {
        try {
            const data = await subcategoriesApi.getAll();
            setSubcategories(data);
        } catch (error) {
            console.error("Failed to fetch subcategories:", error);
        }
    };

    const handleAddSize = () => {
        const newSize: ProductSize = {
            id: `new-${Math.random().toString(36).substr(2, 9)}`,
            size: "",
            quantity: 0,
            price: 0,
        };
        setSizes([...sizes, newSize]);
    };

    const handleSizeChange = (id: string, field: keyof ProductSize, value: string | number) => {
        setSizes(sizes.map(size =>
            size.id === id ? { ...size, [field]: value } : size
        ));
    };

    const handleRemoveSize = (id: string) => {
        setSizes(sizes.filter(size => size.id !== id));
    };

    const handleAddBenefit = () => {
        if (!newBenefit.trim()) return;
        setBenefits([...benefits, { id: `new-${Math.random().toString(36).substr(2, 9)}`, text: newBenefit }]);
        setNewBenefit("");
    };

    const handleAddIngredient = () => {
        if (!newIngredient.trim()) return;
        setIngredients([...ingredients, { id: `new-${Math.random().toString(36).substr(2, 9)}`, text: newIngredient }]);
        setNewIngredient("");
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: ProductImage[] = Array.from(files).map(file => ({
            id: `new-${Math.random().toString(36).substr(2, 9)}`,
            url: URL.createObjectURL(file),
            file,
            isExisting: false,
        }));

        setImages([...images, ...newImages]);
    };

    const handleRemoveImage = (id: string) => {
        const imageToRemove = images.find(img => img.id === id);
        if (imageToRemove && imageToRemove.file) {
            URL.revokeObjectURL(imageToRemove.url);
        }
        setImages(images.filter(img => img.id !== id));
    };

    const handleUpdateProduct = async () => {
        if (!title || !categoryId || images.length === 0 || sizes.length === 0) {
            alert("Please fill in all required fields: Title, Category, at least one Image, and at least one Size");
            return;
        }

        const invalidSizes = sizes.filter(s => !s.size || s.price <= 0 || s.quantity < 0);
        if (invalidSizes.length > 0) {
            alert("Please ensure all sizes have a name, price greater than 0, and quantity >= 0");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            if (description) formData.append("description", description);
            if (longDescription) formData.append("longDescription", longDescription);
            if (brand) formData.append("brand", brand);
            if (sku) formData.append("sku", sku);
            if (discount) formData.append("discount", discount);
            formData.append("categoryId", categoryId);
            if (subcategoryId) formData.append("subcategoryId", subcategoryId);
            formData.append("featured", isFeatured.toString());

            // Append only new images (files)
            const newImageFiles = images.filter(img => img.file);
            if (newImageFiles.length > 0) {
                newImageFiles.forEach((image) => {
                    if (image.file) {
                        formData.append("images", image.file);
                    }
                });
            }

            // Convert sizes to the format expected by backend
            const sizesData = sizes.map(({ size, quantity, price }) => ({ size, quantity, price }));
            formData.append("sizes", JSON.stringify(sizesData));

            // Add benefits and ingredients
            const benefitsData = benefits.map(b => b.text);
            formData.append("benefits", JSON.stringify(benefitsData));

            const ingredientsData = ingredients.map(i => i.text);
            formData.append("ingredients", JSON.stringify(ingredientsData));

            await productsApi.update(parseInt(productId), formData);

            router.push("/products");
        } catch (error) {
            console.error("Failed to update product:", error);
            alert("Failed to update product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading product...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Edit Product</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/products")}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateProduct} disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Product"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Basic Information */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <h2 className="text-lg font-semibold">Basic Information</h2>

                            <div>
                                <Label>Product Title *</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter product title"
                                />
                            </div>

                            <div>
                                <Label>Short Description</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief product description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Brand (Optional)</Label>
                                    <Input
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        placeholder="Enter brand name"
                                    />
                                </div>
                                <div>
                                    <Label>SKU</Label>
                                    <Input
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        placeholder="Enter SKU"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Discount (%)</Label>
                                    <Input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        placeholder="Enter discount"
                                    />
                                </div>
                                <div>
                                    <Label>Category *</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Subcategory (Optional)</Label>
                                    <Select
                                        value={subcategoryId}
                                        onValueChange={setSubcategoryId}
                                        disabled={!categoryId || filteredSubcategories.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subcategory" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredSubcategories.map((subcat) => (
                                                <SelectItem key={subcat.id} value={subcat.id.toString()}>
                                                    {subcat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <Switch
                                        checked={isFeatured}
                                        onCheckedChange={setIsFeatured}
                                        id="featured"
                                    />
                                    <Label htmlFor="featured">Featured Product</Label>
                                </div>
                            </div>
                        </div>

                        {/* Sizes Section */}
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Sizes & Prices *</Label>
                                <Button variant="outline" size="sm" onClick={handleAddSize}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Size
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {sizes.map((size) => (
                                    <div key={size.id} className="flex gap-2 items-start">
                                        <Input
                                            placeholder="Size"
                                            value={size.size}
                                            onChange={(e) => handleSizeChange(size.id, "size", e.target.value)}
                                            className="flex-1"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Quantity"
                                            value={size.quantity || ""}
                                            onChange={(e) => handleSizeChange(size.id, "quantity", parseInt(e.target.value) || 0)}
                                            className="flex-1"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Price"
                                            value={size.price || ""}
                                            onChange={(e) => handleSizeChange(size.id, "price", parseFloat(e.target.value) || 0)}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveSize(size.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {sizes.length === 0 && (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        No sizes added yet. Click "Add Size" to add product variants.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Additional Information */}
                    <div className="space-y-6">
                        {/* Benefits Section */}
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <Label>Benefits (Optional)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newBenefit}
                                    onChange={(e) => setNewBenefit(e.target.value)}
                                    placeholder="Add a benefit"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddBenefit()}
                                />
                                <Button onClick={handleAddBenefit}>Add</Button>
                            </div>
                            <div className="space-y-2">
                                {benefits.map((benefit) => (
                                    <div key={benefit.id} className="flex items-center gap-2">
                                        <div className="flex-1 p-2 bg-slate-50 rounded-md">
                                            {benefit.text}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setBenefits(benefits.filter(b => b.id !== benefit.id))}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ingredients Section */}
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <Label>Ingredients (Optional)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newIngredient}
                                    onChange={(e) => setNewIngredient(e.target.value)}
                                    placeholder="Add an ingredient"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                                />
                                <Button onClick={handleAddIngredient}>Add</Button>
                            </div>
                            <div className="space-y-2">
                                {ingredients.map((ingredient) => (
                                    <div key={ingredient.id} className="flex items-center gap-2">
                                        <div className="flex-1 p-2 bg-slate-50 rounded-md">
                                            {ingredient.text}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIngredients(ingredients.filter(i => i.id !== ingredient.id))}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Long Description */}
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <Label>Long Description</Label>
                            <div className="border rounded-md">
                                <QuillEditor
                                    value={longDescription}
                                    onChange={setLongDescription}
                                />
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <Label>Product Images *</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {images.map((image) => (
                                    <div key={image.id} className="relative aspect-square">
                                        <img
                                            src={image.url}
                                            alt="Product"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() => handleRemoveImage(image.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <label className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                                    <Upload className="h-8 w-8 mb-2 text-slate-400" />
                                    <span className="text-sm text-slate-500">Upload Image</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
