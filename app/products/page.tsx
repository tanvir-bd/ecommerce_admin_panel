"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit2, Trash2 } from "lucide-react";
import { productsApi } from "@/lib/api-client";

interface ProductSize {
  size: string;
  price: number;
}

interface ProductImage {
  id: number;
  url: string;
}

interface Product {
  id: number;
  title: string;
  images: ProductImage[];
  categoryId: number;
  subcategoryId?: number;
  sizes: ProductSize[];
  featured: boolean;
  category?: {
    id: number;
    name: string;
  };
}

import { useUserPermissions } from "@/hooks/use-permissions";

export default function ProductsPage() {
  const router = useRouter();
  const { can } = useUserPermissions();
  const [products, setProducts] = useState<Product[]>([]);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleToggleFeatured = async (productId: number, currentValue: boolean) => {
    try {
      await productsApi.updateFeatured(productId, !currentValue);
      await fetchProducts();
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    setIsLoading(true);
    try {
      await productsApi.delete(deletingProduct.id);
      await fetchProducts();
      setDeletingProduct(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
        {can('products', 'create') && (
          <Button onClick={() => router.push("/products/new")}>
            Create New Product
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Sizes & Prices</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${product.images?.[0]?.url || '/placeholder.png'}`}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>{product.category?.name || "Unknown"}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {product.sizes.map((size, index) => (
                      <div key={index} className="text-sm">
                        {size.size}: {formatPrice(size.price)}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.featured}
                    onCheckedChange={() => handleToggleFeatured(product.id, product.featured)}
                    disabled={!can('products', 'edit')}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {can('products', 'edit') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/products/${product.id}`)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {can('products', 'delete') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingProduct(product)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingProduct?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProduct(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
