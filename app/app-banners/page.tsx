"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Trash2, Plus } from "lucide-react";
import { appBannersApi } from "@/lib/api-client";

interface Banner {
  id: number;
  imageUrl: string;
}

export default function AppBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const data = await appBannersApi.getAll();
      setBanners(data);
    } catch (error) {
      console.error("Failed to fetch app banners:", error);
      alert("Failed to load app banners");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("image", file);
        await appBannersApi.create(formData);
      }
      await fetchBanners();
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (!files) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length > 0) {
      const fileList = new DataTransfer();
      imageFiles.forEach((file) => fileList.items.add(file));
      handleImageUpload(fileList.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDeleteClick = (banner: Banner) => {
    setDeletingBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBanner) return;

    try {
      await appBannersApi.delete(deletingBanner.id);
      await fetchBanners();
      setIsDeleteDialogOpen(false);
      setDeletingBanner(null);
    } catch (error) {
      console.error("Failed to delete banner:", error);
      alert("Failed to delete banner");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">App Banners</h1>
      </div>

      {/* Upload Section */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 transition-colors ${isDraggingOver ? "border-blue-500 bg-blue-50" : "border-slate-200"
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload className="h-12 w-12 text-slate-400" />
          <div className="text-center">
            <p className="text-lg font-medium">Drop your banner images here</p>
            <p className="text-sm text-slate-500">or click to browse</p>
          </div>
          <label className="relative">
            <Button disabled={isUploading}>
              <Plus className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Add Banners"}
            </Button>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="group relative aspect-[21/9] rounded-lg overflow-hidden border"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${banner.imageUrl}`}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => handleDeleteClick(banner)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && !isLoading && (
        <div className="text-center py-12 text-slate-500">
          <p>No banners yet. Upload some banner images to get started.</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this banner? This action cannot be undone.
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
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
