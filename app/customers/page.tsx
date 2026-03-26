"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { customersApi } from "@/lib/api-client";

import { useUserPermissions } from "@/hooks/use-permissions";

interface Customer {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export default function CustomersPage() {
  const { can } = useUserPermissions();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;

    setIsLoading(true);
    try {
      await customersApi.delete(deletingCustomer.id);
      await fetchCustomers();
      setDeletingCustomer(null);
    } catch (error) {
      console.error("Failed to delete customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Customers</h1>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.username}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{formatDate(customer.createdAt)}</TableCell>
                <TableCell className="text-right">
                  {can('customers', 'delete') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCustomer(customer)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deletingCustomer} onOpenChange={() => setDeletingCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Confirm Deletion <br /><br />
              Are you sure you want to delete this user? This action cannot be undone. All associated data (orders, reviews, cart) will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCustomer(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomer} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
