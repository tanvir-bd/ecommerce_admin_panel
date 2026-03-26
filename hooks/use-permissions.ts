"use client";

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { Module, Permission, hasPermission, Role } from '@/lib/permissions';

export function useUserPermissions() {
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = () => {
            try {
                const session = getCookie('admin_session');
                if (session) {
                    const sessionData = JSON.parse(session as string);
                    // Handle structure { access_token, user: { role } } OR { role }
                    const userRole = sessionData.user?.role || sessionData.role;
                    setRole(userRole as Role);
                }
            } catch (error) {
                console.error("Failed to parse session:", error);
            } finally {
                setLoading(false);
            }
        };

        checkRole();
    }, []);

    const can = (module: Module, action: Permission) => {
        if (!role) return false;
        return hasPermission(role, module, action);
    };

    return {
        role,
        loading,
        can,
    };
}
