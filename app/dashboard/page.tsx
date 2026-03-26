"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
// import { OrdersTable } from "@/components/dashboard/orders-table"; // We need to make this dynamic or build a simple table here
import { SalesChart } from "@/components/dashboard/sales-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { analyticsApi, apiClient } from "@/lib/api-client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalSales: number; // completed orders
    avgOrderValue: number;
}

interface RecentOrder {
    id: number;
    orderId: string;
    total: number;
    orderStatus: string;
    createdAt: string;
    user: {
        username: string;
        email: string;
    };
}

interface RecentCustomer {
    id: number;
    username: string;
    email: string;
    createdAt: string;
}

interface TopProduct {
    id: number;
    title: string;
    sold: number;
    sizes: { quantity: number }[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalSales: 0,
        avgOrderValue: 0,
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, ordersData, customersData, productsData] = await Promise.all([
                    analyticsApi.getDashboardStats(),
                    analyticsApi.getRecentOrders(),
                    analyticsApi.getRecentCustomers(),
                    analyticsApi.getTopProducts()
                ]);

                setStats(statsData);
                setRecentOrders(ordersData);
                setRecentCustomers(customersData);
                setTopProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders.toString()}
                    icon={ShoppingCart}
                    trend={{ value: 0, isPositive: true }} // Trend calculation needs historical data, keeping 0 for now
                />
                <StatsCard
                    title="Total Products"
                    value={stats.totalProducts.toString()}
                    icon={Package}
                    trend={{ value: 0, isPositive: true }}
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend={{ value: 0, isPositive: true }}
                />
                <StatsCard
                    title="Total Sales (Completed)"
                    value={stats.totalSales.toString()}
                    icon={TrendingUp}
                    trend={{ value: 0, isPositive: true }}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <SalesChart />
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-blue-500" />
                                        <span className="truncate max-w-[150px]" title={product.title}>{product.title}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {product.sold} sold
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.orderId}</TableCell>
                                        <TableCell>{order.user.username}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.orderStatus === 'completed' ? 'bg-green-50 text-green-700' :
                                                order.orderStatus === 'processing' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                {order.orderStatus.replace('_', ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">${Number(order.total).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentCustomers.map((customer) => (
                                <div key={customer.id} className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                        {customer.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{customer.username}</span>
                                        <span className="text-xs text-gray-500">{customer.email}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
