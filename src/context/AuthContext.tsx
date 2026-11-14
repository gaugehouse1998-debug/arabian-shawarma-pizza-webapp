import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerProfile } from '../types';
import { storageService } from '../services/storageService';
import { adminAuthService, AdminSession } from '../services/adminAuthService';

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  currentUser: UserSession | null;
  isAdmin: boolean;
  mustChangePassword: boolean;
  loginCustomer: (phone: string, name?: string, email?: string) => Promise<boolean>;
  loginAdmin: (loginId: string, password: string) => Promise<{ success: boolean; mustChangePassword?: boolean; message?: string }>;
  changeAdminPassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateCustomerProfile: (data: Partial<CustomerProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      // Check for active admin session first
      const adminSession = adminAuthService.getActiveSession();
      if (adminSession) {
        return {
          id: adminSession.adminId,
          name: 'Restaurant Administrator',
          phone: '+92 322-2222461',
          email: adminSession.adminId,
          role: 'admin'
        };
      }

      const stored = localStorage.getItem('asp_user_session');
      if (!stored) return null;
      const parsed = JSON.parse(stored) as unknown;
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed) ||
        typeof (parsed as UserSession).id !== 'string' ||
        typeof (parsed as UserSession).name !== 'string' ||
        (parsed as UserSession).role !== 'customer'
      ) {
        localStorage.removeItem('asp_user_session');
        return null;
      }
      return parsed as UserSession;
    } catch {
      try {
        localStorage.removeItem('asp_user_session');
      } catch {
        // Ignore cleanup errors
      }
      return null;
    }
  });

  const [mustChangePassword, setMustChangePassword] = useState<boolean>(() => {
    const adminSession = adminAuthService.getActiveSession();
    return Boolean(adminSession?.mustChangePassword);
  });

  useEffect(() => {
    try {
      if (currentUser) {
        if (currentUser.role === 'customer') {
          localStorage.setItem('asp_user_session', JSON.stringify(currentUser));
        }
      } else {
        localStorage.removeItem('asp_user_session');
      }
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }, [currentUser]);

  const isAdmin = currentUser?.role === 'admin';

  const loginCustomer = async (phone: string, name?: string, email?: string): Promise<boolean> => {
    const existing = storageService.getCustomerByPhone(phone);
    const userSession: UserSession = {
      id: existing ? existing.id : `cust-${Date.now()}`,
      name: name || existing?.name || 'Valued Guest',
      phone: phone.trim(),
      email: email || existing?.email,
      address: existing?.address,
      role: 'customer'
    };

    if (!existing) {
      storageService.saveCustomer({
        id: userSession.id,
        name: userSession.name,
        phone: userSession.phone,
        email: userSession.email,
        address: userSession.address,
        registeredAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpend: 0,
        status: 'active',
        tags: ['New Customer'],
        internalNotes: 'Self-registered customer account.',
        orders: []
      });
    }

    // Customer can NEVER receive admin role
    setCurrentUser(userSession);
    setMustChangePassword(false);
    return true;
  };

  const loginAdmin = async (
    loginId: string,
    password: string
  ): Promise<{ success: boolean; mustChangePassword?: boolean; message?: string }> => {
    const res = await adminAuthService.login(loginId, password);
    if (res.success && res.session) {
      const adminSession: UserSession = {
        id: res.session.adminId,
        name: 'Restaurant Administrator',
        phone: '+92 322-2222461',
        email: res.session.adminId,
        role: 'admin'
      };
      setCurrentUser(adminSession);
      setMustChangePassword(Boolean(res.mustChangePassword));
      return {
        success: true,
        mustChangePassword: res.mustChangePassword
      };
    }

    return {
      success: false,
      message: res.message || 'Unauthorized admin access.'
    };
  };

  const changeAdminPassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await adminAuthService.changePassword(currentPassword, newPassword, confirmPassword);
    if (res.success) {
      setMustChangePassword(false);
    }
    return res;
  };

  const logout = () => {
    if (isAdmin) {
      adminAuthService.logout();
    }
    setCurrentUser(null);
    setMustChangePassword(false);
    localStorage.removeItem('asp_user_session');
  };

  const updateCustomerProfile = (data: Partial<CustomerProfile>) => {
    if (!currentUser || currentUser.role !== 'customer') return;
    const existing = storageService.getCustomerById(currentUser.id);
    if (existing) {
      const updated = storageService.saveCustomer({
        ...existing,
        ...data
      });
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              name: updated.name,
              phone: updated.phone,
              email: updated.email,
              address: updated.address
            }
          : null
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        mustChangePassword,
        loginCustomer,
        loginAdmin,
        changeAdminPassword,
        logout,
        updateCustomerProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
