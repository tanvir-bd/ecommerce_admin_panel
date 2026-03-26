"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit2, Trash2, Upload } from "lucide-react";
import { categoriesApi, subcategoriesApi } from "@/lib/api-client";

interface Category {
  id: number;
  name: string;
  image: string;
}

interface Subcategory {
  id: number;
  name: string;
  image: string;
  categoryId: number;
  category?: Category;
}

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create state
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryCategory, setNewSubcategoryCategory] = useState("");
  const [newSubcategoryImage, setNewSubcategoryImage] = useState<File | null>(null);
  const [newSubcategoryImagePreview, setNewSubcategoryImagePreview] = useState("");

  // Edit state
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [editSubcategoryName, setEditSubcategoryName] = useState("");
  const [editSubcategoryCategory, setEditSubcategoryCategory] = useState("");
  const [editSubcategoryImage, setEditSubcategoryImage] = useState<File | null>(null);
  const [editSubcategoryImagePreview, setEditSubcategoryImagePreview] = useState("");

  // Delete state
  const [deletingSubcategory, setDeletingSubcategory] = useState<Subcategory | null>(null);

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const data = await subcategoriesApi.getAll();
      setSubcategories(data);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
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

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName || !newSubcategoryCategory || !newSubcategoryImage) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newSubcategoryName);
      formData.append("categoryId", newSubcategoryCategory);
      formData.append("image", newSubcategoryImage);

      await subcategoriesApi.create(formData);
      await fetchSubcategories();

      setNewSubcategoryName("");
      setNewSubcategoryCategory("");
      setNewSubcategoryImage(null);
      setNewSubcategoryImagePreview("");
    } catch (error) {
      console.error("Failed to create subcategory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setEditSubcategoryName(subcategory.name);
    setEditSubcategoryCategory(subcategory.categoryId.toString());
    setEditSubcategoryImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${subcategory.image}`);
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory || !editSubcategoryName || !editSubcategoryCategory) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editSubcategoryName);
      formData.append("categoryId", editSubcategoryCategory);
      if (editSubcategoryImage) {
        formData.append("image", editSubcategoryImage);
      }

      await subcategoriesApi.update(editingSubcategory.id, formData);
      await fetchSubcategories();

      setEditingSubcategory(null);
      setEditSubcategoryName("");
      setEditSubcategoryCategory("");
      setEditSubcategoryImage(null);
      setEditSubcategoryImagePreview("");
    } catch (error) {
      console.error("Failed to update subcategory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!deletingSubcategory) return;

    setIsLoading(true);
    try {
      await subcategoriesApi.delete(deletingSubcategory.id);
      await fetchSubcategories();
      setDeletingSubcategory(null);
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSubcategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSubcategoryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSubcategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditSubcategoryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Sub Categories</h1>

      {/* Create New Subcategory */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Sub Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Sub Category Name</Label>
            <Input
              placeholder="Enter sub category name"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Parent Category</Label>
            <Select value={newSubcategoryCategory} onValueChange={setNewSubcategoryCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sub Category Image</Label>
            <div className="flex items-center gap-4">
              {newSubcategoryImagePreview && (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border">
                  <img
                    src={newSubcategoryImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <label className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                <Upload className="h-8 w-8 mb-2 text-slate-400" />
                <span className="text-sm text-slate-600">Upload Image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleNewImageChange}
                />
              </label>
            </div>
          </div>
        </div>
        <Button
          onClick={handleCreateSubcategory}
          className="mt-4"
          disabled={isLoading || !newSubcategoryName || !newSubcategoryCategory || !newSubcategoryImage}
        >
          {isLoading ? "Creating..." : "Create Sub Category"}
        </Button>
      </div>

      {/* Subcategories Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sub Category Name</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcategories.map((subcategory) => (
              <TableRow key={subcategory.id}>
                <TableCell className="font-medium">{subcategory.name}</TableCell>
                <TableCell>{getCategoryName(subcategory.categoryId)}</TableCell>
                <TableCell>
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${subcategory.image}`}
                      alt={subcategory.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(subcategory)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingSubcategory(subcategory)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubcategory} onOpenChange={() => setEditingSubcategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sub Category</DialogTitle>
            <DialogDescription>
              Update the subcategory information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sub Category Name</Label>
              <Input
                value={editSubcategoryName}
                onChange={(e) => setEditSubcategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select value={editSubcategoryCategory} onValueChange={setEditSubcategoryCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sub Category Image</Label>
              <div className="flex items-center gap-4">
                {editSubcategoryImagePreview && (
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border">
                    <img
                      src={editSubcategoryImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <label className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                  <Upload className="h-8 w-8 mb-2 text-slate-400" />
                  <span className="text-sm text-slate-600">Upload New Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleEditImageChange}
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSubcategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubcategory} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingSubcategory} onOpenChange={() => setDeletingSubcategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sub Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingSubcategory?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSubcategory(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubcategory} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
