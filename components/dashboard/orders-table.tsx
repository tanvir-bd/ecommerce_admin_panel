import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  customer: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  date: string;
  total: string;
}

const orders: Order[] = [
  {
    id: "ORD001",
    customer: "John Doe",
    status: "completed",
    date: "2024-03-10",
    total: "$299.99"
  },
  {
    id: "ORD002",
    customer: "Jane Smith",
    status: "processing",
    date: "2024-03-09",
    total: "$149.99"
  },
  {
    id: "ORD003",
    customer: "Bob Johnson",
    status: "pending",
    date: "2024-03-09",
    total: "$499.99"
  },
  {
    id: "ORD004",
    customer: "Alice Brown",
    status: "cancelled",
    date: "2024-03-08",
    total: "$89.99"
  },
  {
    id: "ORD005",
    customer: "Charlie Wilson",
    status: "completed",
    date: "2024-03-08",
    total: "$199.99"
  }
];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

export function OrdersTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusColors[order.status]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell className="text-right">{order.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
