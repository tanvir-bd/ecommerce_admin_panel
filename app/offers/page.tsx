"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Trash2, ExternalLink } from "lucide-react";
import { offersApi } from "@/lib/api-client";

interface Offer {
  id: number;
  title: string;
  link: string;
  type: string;
  imageUrl: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState<string>("crazy deals");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const data = await offersApi.getAll();
      setOffers(data);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
      alert("Failed to load offers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !link || !type || !selectedFile) {
      alert("Please fill in all fields and select an image");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("title", title);
      formData.append("link", link);
      formData.append("type", type);

      await offersApi.create(formData);
      await fetchOffers();

      // Reset form
      setTitle("");
      setLink("");
      setType("crazy deals");
      setSelectedFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("Failed to create offer:", error);
      alert("Failed to create offer");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (offer: Offer) => {
    setDeletingOffer(offer);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOffer) return;

    try {
      await offersApi.delete(deletingOffer.id);
      await fetchOffers();
      setIsDeleteDialogOpen(false);
      setDeletingOffer(null);
    } catch (error) {
      console.error("Failed to delete offer:", error);
      alert("Failed to delete offer");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Offers Management</h1>
      </div>

      {/* Create Offer Form */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Offer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Offer Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter offer title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Offer Link</Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/offer-page"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Offer Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crazy-deal">Crazy Deals</SelectItem>
                  <SelectItem value="special-combo">Special Combos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Offer Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                required
              />
            </div>
          </div>

          {previewUrl && (
            <div className="mt-4">
              <Label>Image Preview</Label>
              <div className="mt-2 border rounded-lg p-4 bg-slate-50">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 mx-auto object-contain"
                />
              </div>
            </div>
          )}

          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Create Offer
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Offers Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  No offers found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${offer.imageUrl}`}
                      alt={offer.title}
                      className="h-16 w-24 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{offer.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${offer.type === 'crazy deals'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-purple-100 text-purple-700'
                      }`}>
                      {offer.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={offer.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      {offer.link}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(offer)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingOffer?.title}&quot;?
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
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
