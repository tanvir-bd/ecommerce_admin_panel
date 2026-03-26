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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Edit2, Trash2, UserPlus, Search } from "lucide-react";
import { adminsApi } from "@/lib/api-client";
import { format } from "date-fns";
import { useUserPermissions } from "@/hooks/use-permissions";

interface AdminUser {
    id: number;
    username: string;
    email: string;
    role: string;
    joinedDate: string;
}

export default function AdminsPage() {
    // Permissions
    const { can } = useUserPermissions();

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // Data States
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Create Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("admin");

    // Edit Dialog States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
    const [editUsername, setEditUsername] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPassword, setEditPassword] = useState(""); // Optional update
    const [editRole, setEditRole] = useState("");

    // Delete Dialog States
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);

    // Fetch Admins
    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (searchQuery) params.search = searchQuery;
            if (roleFilter !== "all") params.role = roleFilter;

            const data = await adminsApi.getAll(params);
            setAdmins(data);
        } catch (error) {
            console.error("Failed to fetch admins:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [roleFilter]); // Refetch when role changes. Search is manual or debounced? Let's make search manual via button or enter for now to match simple UI.

    const handleSearch = () => {
        fetchAdmins();
    };

    const handleCreate = async () => {
        if (!newUsername || !newEmail || !newPassword || !newRole) return;

        setIsLoading(true);
        try {
            await adminsApi.create({
                username: newUsername,
                email: newEmail,
                password: newPassword,
                role: newRole,
            });
            await fetchAdmins();
            setIsCreateOpen(false);
            // Reset form
            setNewUsername("");
            setNewEmail("");
            setNewPassword("");
            setNewRole("admin");
        } catch (error) {
            console.error("Failed to create admin:", error);
            // Add toast notification here ideally
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditOpen = (admin: AdminUser) => {
        setEditingAdmin(admin);
        setEditUsername(admin.username);
        setEditEmail(admin.email);
        setEditRole(admin.role);
        setEditPassword(""); // Reset password field
        setIsEditOpen(true);
    };

    const handleEditSave = async () => {
        if (!editingAdmin) return;

        setIsLoading(true);
        try {
            const data: any = {
                username: editUsername,
                email: editEmail,
                role: editRole,
            };
            if (editPassword) {
                data.password = editPassword;
            }

            await adminsApi.update(editingAdmin.id, data);
            await fetchAdmins();
            setIsEditOpen(false);
        } catch (error) {
            console.error("Failed to update admin:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingAdmin) return;

        setIsLoading(true);
        try {
            await adminsApi.delete(deletingAdmin.id);
            await fetchAdmins();
            setIsDeleteOpen(false);
        } catch (error) {
            console.error("Failed to delete admin:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Admin Management</h1>
                {can('admins', 'create') && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Add New User
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-lg border">
                <div className="flex-1 max-w-sm flex gap-2">
                    <Input
                        placeholder="Search by username or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button variant="secondary" onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                <div className="w-[200px]">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="user">User (Customer)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            admins.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell className="font-medium">{admin.username}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                      ${admin.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                admin.role === 'supervisor' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'}`}>
                                            {admin.role.toUpperCase()}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {admin.joinedDate ? format(new Date(admin.joinedDate), "MMM dd, yyyy") : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {can('admins', 'edit') && (
                                                <Button variant="ghost" size="icon" onClick={() => handleEditOpen(admin)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {can('admins', 'delete') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => { setDeletingAdmin(admin); setIsDeleteOpen(true); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>Create a new admin or supervisor account.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="supervisor">Supervisor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={isLoading}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password (Optional)</Label>
                            <Input
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={editRole} onValueChange={setEditRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="supervisor">Supervisor</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditSave} disabled={isLoading}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {deletingAdmin?.username}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
