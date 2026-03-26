"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { analyticsApi, productsApi } from "@/lib/api-client";
import { Loader2, TrendingUp, Users, ShoppingBag, DollarSign, Package } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AnalyticsPage() {
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [ordersAnalytics, setOrdersAnalytics] = useState<any[]>([]);
    const [customersAnalytics, setCustomersAnalytics] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [productAnalytics, setProductAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedProductId) {
            fetchProductAnalytics(Number(selectedProductId));
        }
    }, [selectedProductId]);

    const fetchInitialData = async () => {
        try {
            const [stats, orders, customers, allProducts] = await Promise.all([
                analyticsApi.getDashboardStats(),
                analyticsApi.getOrdersAnalytics(),
                analyticsApi.getCustomersAnalytics(),
                productsApi.getAll()
            ]);

            setDashboardStats(stats);
            setOrdersAnalytics(orders);
            setCustomersAnalytics(customers);
            setProducts(allProducts || []);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch analytics data", error);
            setIsLoading(false);
        }
    };

    const fetchProductAnalytics = async (id: number) => {
        try {
            const data = await analyticsApi.getProductAnalytics(id);
            setProductAnalytics(data);
        } catch (error) {
            console.error("Failed to fetch product analytics", error);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(value);
    };

    const getImageUrl = (url: string) => {
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}${url}`;
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(dashboardStats?.totalRevenue || 0)}</div>
                        <p className="text-xs text-muted-foreground">Lifetime revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats?.totalOrders || 0}</div>
                        <p className="text-xs text-muted-foreground">Lifetime orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(dashboardStats?.avgOrderValue || 0)}</div>
                        <p className="text-xs text-muted-foreground">Per order average</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ordersAnalytics}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => {
                                            const date = new Date(str);
                                            return `${date.getDate()}/${date.getMonth() + 1}`;
                                        }}
                                        fontSize={12}
                                    />
                                    <YAxis fontSize={12} />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value)}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Revenue" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>New Customers (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={customersAnalytics}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => {
                                            const date = new Date(str);
                                            return `${date.getDate()}/${date.getMonth() + 1}`;
                                        }}
                                        fontSize={12}
                                    />
                                    <YAxis allowDecimals={false} fontSize={12} />
                                    <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                                    <Legend />
                                    <Bar dataKey="newCustomers" fill="#82ca9d" name="New Customers" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Product Analytics */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="w-[300px]">
                            <label className="text-sm font-medium mb-2 block">Select Product</label>
                            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                            {product.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {productAnalytics && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="flex gap-4">
                                    <div className="h-32 w-32 rounded-lg border overflow-hidden bg-gray-100 flex-shrink-0">
                                        {productAnalytics.images && productAnalytics.images.length > 0 ? (
                                            <img
                                                src={getImageUrl(productAnalytics.images[0].url)}
                                                alt={productAnalytics.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                <Package className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{productAnalytics.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{productAnalytics.description}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">SKU: {productAnalytics.sku || 'N/A'}</span>
                                            {productAnalytics.featured && (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Featured</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <span className="text-sm text-gray-500">Total Sold</span>
                                        <div className="text-2xl font-bold">{productAnalytics.sold || 0} units</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <span className="text-sm text-gray-500">Total Revenue Generated</span>
                                        <div className="text-2xl font-bold text-green-600">{formatCurrency(productAnalytics.totalRevenue || 0)}</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <span className="text-sm text-gray-500">Current Stock</span>
                                        <div className="text-2xl font-bold">{productAnalytics.totalStock || 0} units</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
