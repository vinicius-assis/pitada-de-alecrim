"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Home, Utensils, History, DollarSign, Settings, LogOut, User } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const isAdmin = (session.user as any)?.role === "ADMIN";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/orders/new", label: "Novo Pedido", icon: Utensils },
    { href: "/orders", label: "Histórico", icon: History },
    { href: "/cashier", label: "Caixa", icon: DollarSign },
    ...(isAdmin ? [{ href: "/dishes", label: "Items", icon: Settings }] : []),
  ];

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                Pitada de Alecrim
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-primary-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-700">
              <User className="w-4 h-4 mr-2" />
              <span>{session.user?.name}</span>
              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs">
                {(session.user as any)?.role === "ADMIN" ? "Admin" : "Garçom"}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

