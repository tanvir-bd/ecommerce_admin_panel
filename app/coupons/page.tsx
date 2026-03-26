"use client";

import { useState, useEffect } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";
import { couponsApi } from "@/lib/api-client";

interface DateRange {
  from: Date;
  to: Date | undefined;
}

interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function CouponsPage() {
  // States for new coupon form
  const [newCouponName, setNewCouponName] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");

  // States for edit/delete dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // State for coupons list
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
  const [editDateRange, setEditDateRange] = useState<DateRange | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await couponsApi.getAll();
      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      alert("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCouponName || !newCouponDiscount || !selectedDateRange || !selectedDateRange.to) return;

    try {
      await couponsApi.create({
        code: newCouponName,
        discountPercent: Number(newCouponDiscount),
        validFrom: selectedDateRange.from.toISOString().split('T')[0],
        validUntil: selectedDateRange.to.toISOString().split('T')[0],
      });

      await fetchCoupons();
      setNewCouponName("");
      setNewCouponDiscount("");
      setSelectedDateRange(null);
    } catch (error) {
      console.error("Failed to create coupon:", error);
      alert("Failed to create coupon");
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setEditDateRange({
      from: new Date(coupon.validFrom),
      to: new Date(coupon.validUntil),
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCoupon) return;

    try {
      await couponsApi.delete(selectedCoupon.id);
      await fetchCoupons();
      setIsDeleteDialogOpen(false);
      setSelectedCoupon(null);
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      alert("Failed to delete coupon");
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedCoupon || !editDateRange || !editDateRange.to) return;

    try {
      await couponsApi.update(selectedCoupon.id, {
        code: selectedCoupon.code,
        discountPercent: selectedCoupon.discountPercent,
        validFrom: editDateRange.from.toISOString().split('T')[0],
        validUntil: (editDateRange.to as Date).toISOString().split('T')[0],
      });

      await fetchCoupons();
      setIsEditDialogOpen(false);
      setSelectedCoupon(null);
      setEditDateRange(null);
    } catch (error) {
      console.error("Failed to update coupon:", error);
      alert("Failed to update coupon");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Create New Coupon</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Coupon Code</label>
            <Input
              placeholder="Enter coupon code"
              value={newCouponName}
              onChange={(e) => setNewCouponName(e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Discount (%)</label>
            <Input
              type="number"
              placeholder="Enter discount percentage"
              value={newCouponDiscount}
              onChange={(e) => setNewCouponDiscount(e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Valid Period</label>
            <div className="flex items-center gap-2">
              <DateRangePicker
                onUpdate={({ range }) => setSelectedDateRange(range)}
                initialDateFrom={new Date().toISOString().split('T')[0]}
                initialDateTo={new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]}
                align="start"
                locale="en-GB"
                showCompare={false}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleCreateCoupon}
            disabled={!newCouponName || !newCouponDiscount || !selectedDateRange}
          >
            Create Coupon
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coupon Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Valid To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                  No coupons found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>{Number(coupon.discountPercent)}%</TableCell>
                  <TableCell>{new Date(coupon.validFrom).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(coupon.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${coupon.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCoupon(coupon)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCoupon(coupon)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Make changes to the coupon details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Coupon Code</label>
              <Input
                value={selectedCoupon?.code || ""}
                onChange={(e) =>
                  setSelectedCoupon(
                    selectedCoupon
                      ? { ...selectedCoupon, code: e.target.value.toUpperCase() }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Discount (%)</label>
              <Input
                type="number"
                value={selectedCoupon?.discountPercent || ""}
                onChange={(e) =>
                  setSelectedCoupon(
                    selectedCoupon
                      ? { ...selectedCoupon, discountPercent: Number(e.target.value) }
                      : null
                  )
                }
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valid Period</label>
              <DateRangePicker
                onUpdate={({ range }) => setEditDateRange(range)}
                initialDateFrom={selectedCoupon?.validFrom || ""}
                initialDateTo={selectedCoupon?.validUntil || ""}
                align="start"
                locale="en-GB"
                showCompare={false}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedCoupon(null);
                setEditDateRange(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the coupon &quot;{selectedCoupon?.code}&quot;?
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
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
