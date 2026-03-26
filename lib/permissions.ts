export type Role = 'admin' | 'supervisor';

export type Permission = 'view' | 'create' | 'edit' | 'delete';

export type Module =
    | 'dashboard'
    | 'admins'
    | 'customers'
    | 'coupons'
    | 'orders'
    | 'products'
    | 'categories'
    | 'subcategories'
    | 'analytics'
    | 'website_banners'
    | 'app_banners'
    | 'topbar'
    | 'offers' // home screen offers
    | 'reviews';

export const ROLES: Role[] = ['admin', 'supervisor'];

export const MODULES: Module[] = [
    'dashboard',
    'admins',
    'customers',
    'coupons',
    'orders',
    'products',
    'categories',
    'subcategories',
    'analytics',
    'website_banners',
    'app_banners',
    'topbar',
    'offers',
    'reviews',
];

// Define what each role can do
// true = allowed, false = denied (or undefined)
type RolePermissions = {
    [key in Role]: {
        [key in Module]?: Permission[];
    };
};

export const PERMISSIONS: RolePermissions = {
    admin: {
        dashboard: ['view'],
        admins: ['view', 'create', 'edit', 'delete'],
        customers: ['view', 'create', 'edit', 'delete'],
        coupons: ['view', 'create', 'edit', 'delete'],
        orders: ['view', 'create', 'edit', 'delete'],
        products: ['view', 'create', 'edit', 'delete'],
        categories: ['view', 'create', 'edit', 'delete'],
        subcategories: ['view', 'create', 'edit', 'delete'],
        analytics: ['view'],
        website_banners: ['view', 'create', 'edit', 'delete'],
        app_banners: ['view', 'create', 'edit', 'delete'],
        topbar: ['view', 'create', 'edit', 'delete'],
        offers: ['view', 'create', 'edit', 'delete'],
        reviews: ['view', 'edit', 'delete'], // Reviews usually have approve application (edit)
    },
    supervisor: {
        dashboard: ['view'],
        admins: ['view'], // Supervisor can strictly only VIEW admins, not create/edit/delete
        customers: ['view', 'create', 'edit', 'delete'],
        coupons: ['view', 'create', 'edit', 'delete'],
        orders: ['view', 'create', 'edit', 'delete'],
        products: ['view', 'create', 'edit', 'delete'],
        categories: ['view', 'create', 'edit', 'delete'],
        subcategories: ['view', 'create', 'edit', 'delete'],
        analytics: ['view'],
        website_banners: ['view', 'create', 'edit', 'delete'],
        app_banners: ['view', 'create', 'edit', 'delete'],
        topbar: ['view', 'create', 'edit', 'delete'],
        offers: ['view', 'create', 'edit', 'delete'],
        reviews: ['view', 'edit', 'delete'],
    },
};

export function hasPermission(role: string, module: Module, permission: Permission): boolean {
    if (!role || !ROLES.includes(role as Role)) return false;

    const rolePermissions = PERMISSIONS[role as Role];
    const modulePermissions = rolePermissions[module];

    return modulePermissions?.includes(permission) ?? false;
}
