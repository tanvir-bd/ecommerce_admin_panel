"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { categoriesApi } from "@/lib/api-client";

interface Category {
  id: number;
  name: string;
  image: string;
}

export default function CategoriesPage() {
  // States for new category
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [newCategoryImagePreview, setNewCategoryImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // States for category list
  const [categories, setCategories] = useState<Category[]>([]);

  // States for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null);
  const [editCategoryImagePreview, setEditCategoryImagePreview] = useState("");

  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        if (isEdit) {
          setEditCategoryImage(file);
          setEditCategoryImagePreview(preview);
        } else {
          setNewCategoryImage(file);
          setNewCategoryImagePreview(preview);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName || !newCategoryImage) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newCategoryName);
      formData.append("image", newCategoryImage);

      await categoriesApi.create(formData);
      await fetchCategories();

      setNewCategoryName("");
      setNewCategoryImage(null);
      setNewCategoryImagePreview("");
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${category.image}`);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingCategory || !editCategoryName) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editCategoryName);
      if (editCategoryImage) {
        formData.append("image", editCategoryImage);
      }

      await categoriesApi.update(editingCategory.id, formData);
      await fetchCategories();

      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setEditCategoryName("");
      setEditCategoryImage(null);
      setEditCategoryImagePreview("");
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    setIsLoading(true);
    try {
      await categoriesApi.delete(deletingCategory.id);
      await fetchCategories();

      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>

      {/* Create Category Form */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
            />
          </div>
          <div className="space-y-2">
            <Label>Category Image</Label>
            <div className="flex items-center gap-4">
              {newCategoryImagePreview && (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border">
                  <img
                    src={newCategoryImagePreview}
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
                  onChange={(e) => handleImageChange(e)}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={handleCreateCategory}
            disabled={!newCategoryName || !newCategoryImage || isLoading}
          >
            {isLoading ? "Creating..." : "Create Category"}
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${category.image}`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Make changes to the category details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="flex items-center gap-4">
                {editCategoryImagePreview && (
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border">
                    <img
                      src={editCategoryImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <label className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                  <Upload className="h-8 w-8 mb-2 text-slate-400" />
                  <span className="text-sm text-slate-600">Change Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, true)}
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingCategory?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
