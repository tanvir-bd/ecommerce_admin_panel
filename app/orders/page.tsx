"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import { ordersApi } from "@/lib/api-client";
import { useUserPermissions } from "@/hooks/use-permissions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  size: string;
  product?: {
    id: number;
    title: string;
    images?: { url: string }[];
  };
}

interface Order {
  id: number;
  customerId: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  couponId?: number;
  // Shipping Address Fields
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  createdAt: string;
  customer?: {
    id: number;
    username: string;
  };
  items?: OrderItem[];
}

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  order_placed: { label: "Order Placed", color: "bg-slate-100 text-slate-800" },
  order_confirmed: { label: "Order Confirmed", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", color: "bg-yellow-100 text-yellow-800" },
  dispatched: { label: "Dispatched", color: "bg-purple-100 text-purple-800" },
  in_transit: { label: "In Transit", color: "bg-indigo-100 text-indigo-800" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-orange-100 text-orange-800" },
  reaching_destination: { label: "Reaching Destination", color: "bg-teal-100 text-teal-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid", color: "bg-green-100 text-green-800" },
  not_paid: { label: "Not Paid", color: "bg-red-100 text-red-800" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const handleViewOrder = async (orderId: number) => {
    try {
      const order = await ordersApi.getOne(orderId);
      setSelectedOrder(order);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setIsLoading(true);
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await ordersApi.getOne(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Search Filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const orderIdMatch = order.id.toString().includes(searchLower);
      const customerMatch = order.customer?.username.toLowerCase().includes(searchLower);
      if (!orderIdMatch && !customerMatch) return false;
    }

    // Date filter
    if (dateFrom && new Date(order.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && new Date(order.createdAt) > new Date(dateTo)) return false;

    // Payment status filter
    if (paymentStatusFilter !== "all" && order.paymentStatus !== paymentStatusFilter) return false;

    // Payment method filter
    if (paymentMethodFilter !== "all" && order.paymentMethod !== paymentMethodFilter) return false;

    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `৳${Number(price).toLocaleString()}`;
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">All Orders</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Order ID / Customer"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Status</label>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="not_paid">Not Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{order.customer?.username || "Unknown"}</TableCell>
                <TableCell>{formatPrice(order.total)}</TableCell>
                <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                <TableCell>
                  <Badge className={PAYMENT_STATUS_MAP[order.paymentStatus]?.color || ""}>
                    {PAYMENT_STATUS_MAP[order.paymentStatus]?.label || order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={ORDER_STATUS_MAP[order.orderStatus]?.color || ""}>
                    {ORDER_STATUS_MAP[order.orderStatus]?.label || order.orderStatus}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              View and manage order information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-4 rounded-md">
                  <div>
                    <span className="text-slate-600 font-medium">Name:</span>{" "}
                    {selectedOrder.customer?.username || "Unknown"}
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Order Date:</span>{" "}
                    {formatDate(selectedOrder.createdAt)}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-sm bg-slate-50 p-4 rounded-md">
                  <p>{selectedOrder.street}</p>
                  <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.zipCode}</p>
                  <p>{selectedOrder.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="h-16 w-16 rounded overflow-hidden bg-gray-100">
                              {item.product?.images && item.product.images.length > 0 ? (
                                <img
                                  src={getImageUrl(item.product.images[0].url)}
                                  alt={item.product.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.product?.title || "Unknown"}</TableCell>
                          <TableCell>{item.size}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatPrice(item.price)}</TableCell>
                          <TableCell>{formatPrice(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Method:</span>
                      <span className="capitalize font-medium">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Status:</span>
                      <Badge className={PAYMENT_STATUS_MAP[selectedOrder.paymentStatus]?.color || ""}>
                        {PAYMENT_STATUS_MAP[selectedOrder.paymentStatus]?.label || selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-slate-600 font-bold text-base">Total Amount:</span>
                      <span className="font-bold text-base">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Update Order Status</h3>

                  <div className="bg-slate-50 p-4 rounded-md">
                    <Select
                      value={selectedOrder.orderStatus}
                      onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ORDER_STATUS_MAP).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Updating the status will reflect immediately on the user's order history.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
