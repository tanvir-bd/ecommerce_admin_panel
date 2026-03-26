"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { Edit2, Trash2 } from "lucide-react";
import { topbarsApi } from "@/lib/api-client";

interface Topbar {
  id: number;
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
}

export default function TopbarPage() {
  // States for new topbar
  const [newTopbar, setNewTopbar] = useState<Omit<Topbar, 'id'>>({
    title: "",
    textColor: "#000000",
    backgroundColor: "#ffffff",
    link: "",
    hasButton: false,
    buttonText: "",
    buttonTextColor: "#ffffff",
    buttonBackgroundColor: "#000000",
    buttonLink: "",
    isActive: true,
  });

  // States for topbar list
  const [topbars, setTopbars] = useState<Topbar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for edit/delete dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTopbar, setEditingTopbar] = useState<Topbar | null>(null);
  const [deletingTopbar, setDeletingTopbar] = useState<Topbar | null>(null);

  useEffect(() => {
    fetchTopbars();
  }, []);

  const fetchTopbars = async () => {
    try {
      setIsLoading(true);
      const data = await topbarsApi.getAll();
      setTopbars(data);
    } catch (error) {
      console.error("Failed to fetch topbars:", error);
      alert("Failed to load topbars");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTopbar = async () => {
    if (!isFormValid(newTopbar)) return;

    try {
      await topbarsApi.create(newTopbar);
      await fetchTopbars();
      resetForm();
    } catch (error) {
      console.error("Failed to create topbar:", error);
      alert("Failed to create topbar");
    }
  };

  const handleEditClick = (topbar: Topbar) => {
    setEditingTopbar(topbar);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingTopbar || !isFormValid(editingTopbar)) return;

    try {
      await topbarsApi.update(editingTopbar.id, editingTopbar);
      await fetchTopbars();
      setIsEditDialogOpen(false);
      setEditingTopbar(null);
    } catch (error) {
      console.error("Failed to update topbar:", error);
      alert("Failed to update topbar");
    }
  };

  const handleDeleteClick = (topbar: Topbar) => {
    setDeletingTopbar(topbar);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTopbar) return;

    try {
      await topbarsApi.delete(deletingTopbar.id);
      await fetchTopbars();
      setIsDeleteDialogOpen(false);
      setDeletingTopbar(null);
    } catch (error) {
      console.error("Failed to delete topbar:", error);
      alert("Failed to delete topbar");
    }
  };

  const isFormValid = (topbar: Omit<Topbar, 'id'>) => {
    if (!topbar.title || !topbar.textColor || !topbar.backgroundColor || !topbar.link) {
      return false;
    }

    if (topbar.hasButton) {
      return !!(topbar.buttonText && topbar.buttonTextColor && topbar.buttonBackgroundColor && topbar.buttonLink);
    }

    return true;
  };

  const resetForm = () => {
    setNewTopbar({
      title: "",
      textColor: "#000000",
      backgroundColor: "#ffffff",
      link: "",
      hasButton: false,
      buttonText: "",
      buttonTextColor: "#ffffff",
      buttonBackgroundColor: "#000000",
      buttonLink: "",
      isActive: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading topbars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Topbar Management</h1>
      </div>

      {/* Create Topbar Form */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Topbar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Topbar Title</Label>
            <Input
              value={newTopbar.title}
              onChange={(e) => setNewTopbar({ ...newTopbar, title: e.target.value })}
              placeholder="Enter topbar title"
            />
          </div>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={newTopbar.textColor}
                onChange={(e) => setNewTopbar({ ...newTopbar, textColor: e.target.value })}
                className="w-20"
              />
              <Input
                value={newTopbar.textColor}
                onChange={(e) => setNewTopbar({ ...newTopbar, textColor: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={newTopbar.backgroundColor}
                onChange={(e) => setNewTopbar({ ...newTopbar, backgroundColor: e.target.value })}
                className="w-20"
              />
              <Input
                value={newTopbar.backgroundColor}
                onChange={(e) => setNewTopbar({ ...newTopbar, backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Link</Label>
            <Input
              value={newTopbar.link}
              onChange={(e) => setNewTopbar({ ...newTopbar, link: e.target.value })}
              placeholder="Enter topbar link"
            />
          </div>
          <div className="space-y-2">
            <Label>Has Button</Label>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={newTopbar.hasButton}
                onCheckedChange={(checked) => setNewTopbar({ ...newTopbar, hasButton: checked })}
              />
              <span className="text-sm text-slate-500">Enable button options</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Active Status</Label>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={newTopbar.isActive}
                onCheckedChange={(checked) => setNewTopbar({ ...newTopbar, isActive: checked })}
              />
              <span className="text-sm text-slate-500">
                {newTopbar.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Button Options */}
        {newTopbar.hasButton && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={newTopbar.buttonText}
                onChange={(e) => setNewTopbar({ ...newTopbar, buttonText: e.target.value })}
                placeholder="Enter button text"
              />
            </div>
            <div className="space-y-2">
              <Label>Button Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={newTopbar.buttonTextColor}
                  onChange={(e) => setNewTopbar({ ...newTopbar, buttonTextColor: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={newTopbar.buttonTextColor}
                  onChange={(e) => setNewTopbar({ ...newTopbar, buttonTextColor: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Button Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={newTopbar.buttonBackgroundColor}
                  onChange={(e) => setNewTopbar({ ...newTopbar, buttonBackgroundColor: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={newTopbar.buttonBackgroundColor}
                  onChange={(e) => setNewTopbar({ ...newTopbar, buttonBackgroundColor: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Button Link</Label>
              <Input
                value={newTopbar.buttonLink}
                onChange={(e) => setNewTopbar({ ...newTopbar, buttonLink: e.target.value })}
                placeholder="Enter button link"
              />
            </div>
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={handleCreateTopbar}
            disabled={!isFormValid(newTopbar)}
          >
            Create Topbar
          </Button>
        </div>
      </div>

      {/* Topbars Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Colors</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Button</TableHead>
              <TableHead>Button</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topbars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  No topbars found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              topbars.map((topbar) => (
                <TableRow key={topbar.id}>
                  <TableCell className="font-medium">{topbar.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: topbar.backgroundColor }}
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: topbar.textColor }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{topbar.link}</TableCell>
                  <TableCell>
                    {topbar.hasButton ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{topbar.buttonText}</span>
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: topbar.buttonBackgroundColor }}
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">No button</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${topbar.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {topbar.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(topbar)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(topbar)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Topbar</DialogTitle>
            <DialogDescription>
              Make changes to the topbar details below.
            </DialogDescription>
          </DialogHeader>
          {editingTopbar && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Topbar Title</Label>
                  <Input
                    value={editingTopbar.title}
                    onChange={(e) => setEditingTopbar({ ...editingTopbar, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editingTopbar.textColor}
                      onChange={(e) => setEditingTopbar({ ...editingTopbar, textColor: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={editingTopbar.textColor}
                      onChange={(e) => setEditingTopbar({ ...editingTopbar, textColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editingTopbar.backgroundColor}
                      onChange={(e) => setEditingTopbar({ ...editingTopbar, backgroundColor: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={editingTopbar.backgroundColor}
                      onChange={(e) => setEditingTopbar({ ...editingTopbar, backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Link</Label>
                  <Input
                    value={editingTopbar.link}
                    onChange={(e) => setEditingTopbar({ ...editingTopbar, link: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Has Button</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={editingTopbar.hasButton}
                      onCheckedChange={(checked) => setEditingTopbar({ ...editingTopbar, hasButton: checked })}
                    />
                    <span className="text-sm text-slate-500">Enable button options</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Active Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={editingTopbar.isActive}
                      onCheckedChange={(checked) => setEditingTopbar({ ...editingTopbar, isActive: checked })}
                    />
                    <span className="text-sm text-slate-500">
                      {editingTopbar.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {editingTopbar.hasButton && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={editingTopbar.buttonText}
                      onChange={(e) => setEditingTopbar({ ...editingTopbar, buttonText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={editingTopbar.buttonTextColor}
                        onChange={(e) => setEditingTopbar({ ...editingTopbar, buttonTextColor: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        value={editingTopbar.buttonTextColor}
                        onChange={(e) => setEditingTopbar({ ...editingTopbar, buttonTextColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Button Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={editingTopbar.buttonBackgroundColor}
                        onChange={(e) => setEditingTopbar({ ...editingTopbar, buttonBackgroundColor: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        value={editingTopbar.buttonBackgroundColor}
                        onChange={(e) => setEditingTopbar({ ...editingTopbar, buttonBackgroundColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Button Link</Label>
                    <Input
                      value={editingTopbar.buttonLink}
                      onChange={(e) => setEditingTopbar({ ...editingTopbar, buttonLink: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Topbar</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingTopbar?.title}&quot;?
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
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
