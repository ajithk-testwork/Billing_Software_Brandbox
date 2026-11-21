"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "super-admin" | "branch-admin";

export type AuthUser = {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId: string | null;
  branchName: string | null;
};

type StoredAccount = AuthUser & { password: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  register: (input: {
    branchName: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => { ok: boolean; message: string };
  login: (
    identifier: string,
    password: string,
  ) => { ok: boolean; message: string };
  logout: () => void;
};

const ACCOUNTS_KEY = "brandbox_demo_accounts";
const SESSION_KEY = "brandbox_demo_session";
const AuthContext = createContext<AuthContextValue | null>(null);

function readAccounts(): StoredAccount[] {
  try {
    const value = localStorage.getItem(ACCOUNTS_KEY);
    return value ? (JSON.parse(value) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) setUser(JSON.parse(session) as AuthUser);

      const accounts = readAccounts();
      const demoAccounts: StoredAccount[] = [
        {
          id: "demo-super-admin",
          businessId: "brandbox-demo",
          businessName: "THE BRAND BOX",
          name: "Admin",
          email: "admin@brandbox.demo",
          phone: "9000000001",
          password: "Demo@123",
          role: "super-admin",
          branchId: null,
          branchName: null,
        },
        {
          id: "demo-branch-admin",
          businessId: "brandbox-demo",
          businessName: "THE BRAND BOX",
          name: "Branch Admin",
          email: "branch@brandbox.demo",
          phone: "9000000002",
          password: "Demo@123",
          role: "branch-admin",
          branchId: "chennai-main",
          branchName: "Chennai Main Branch",
        },
      ];
      const merged = [...accounts];
      for (const demo of demoAccounts) {
        if (!merged.some((item) => item.email.toLowerCase() === demo.email))
          merged.push(demo);
      }
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(merged));
    } catch {
      // Keep signed-out state if browser storage is unavailable.
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    (input: {
      branchName: string;
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      const accounts = readAccounts();
      const email = input.email.trim().toLowerCase();
      const phone = input.phone.trim();

      if (accounts.some((item) => item.email.toLowerCase() === email)) {
        return {
          ok: false,
          message: "An account with this email already exists.",
        };
      }

      const businessId = `biz-${Date.now()}`;
      const branchId = `branch-${Date.now()}`;
      const account: StoredAccount = {
        id: `user-${Date.now()}`,
        businessId,
        businessName: "THE BRAND BOX",
        name: input.name.trim(),
        email,
        phone,
        password: input.password,
        role: "super-admin",
        branchId,
        branchName: input.branchName.trim(),
      };

      localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify([...accounts, account]),
      );

      // Store the first branch under the business-specific branch collection.
      localStorage.setItem(
        `brandbox_branches_${businessId}`,
        JSON.stringify([
          {
            id: branchId,
            name: input.branchName.trim(),
            address: "",
            phone,
            status: "Active",
            businessId,
          },
        ]),
      );

      const { password: _password, ...safeUser } = account;
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      setUser(safeUser);
      return { ok: true, message: "Branch account created successfully." };
    },
    [],
  );

  const login = useCallback((identifier: string, password: string) => {
    const value = identifier.trim().toLowerCase();
    const account = readAccounts().find(
      (item) =>
        (item.email.toLowerCase() === value ||
          item.phone === identifier.trim()) &&
        item.password === password,
    );

    if (!account)
      return { ok: false, message: "Invalid email/phone or password." };

    const { password: _password, ...safeUser } = account;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    return { ok: true, message: "Login successful." };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, register, login, logout }),
    [user, loading, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
