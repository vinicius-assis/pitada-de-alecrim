"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Home, Utensils, History, DollarSign, Settings, LogOut, User, Menu, X, Power } from "lucide-react";
import { AdminProfileDropdown } from "./AdminProfileDropdown";
import { CloseShiftButton } from "./CloseShiftButton";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!session) return null;

  const isAdmin = (session.user as any)?.role === "ADMIN";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/orders/new", label: "Novo Pedido", icon: Utensils },
    { href: "/orders", label: "Histórico", icon: History },
    { href: "/cashier", label: "Caixa", icon: DollarSign },
    ...(isAdmin ? [{ href: "/dishes", label: "Items", icon: Settings }] : []),
  ];

  // Menu mobile (sem Novo Pedido)
  const mobileNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/orders", label: "Histórico", icon: History },
    { href: "/cashier", label: "Caixa", icon: DollarSign },
    ...(isAdmin ? [{ href: "/dishes", label: "Items", icon: Settings }] : []),
  ];

  return (
    <>
      <nav className="bg-white shadow-md border-b relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">
                  Pitada de Alecrim
                </h1>
              </div>
              {/* Desktop Menu */}
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
            {/* Desktop User Info */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {isAdmin ? (
                <AdminProfileDropdown />
              ) : (
                <>
                  <div className="flex items-center text-sm text-gray-700">
                    <User className="w-4 h-4 mr-2" />
                    <span>{session.user?.name}</span>
                    <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs">
                      Garçom
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </button>
                </>
              )}
            </div>
            {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded="false"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Mobile Menu */}
          <div className="fixed top-16 left-0 right-0 bg-white shadow-lg z-50 sm:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="pt-2 pb-3 space-y-1">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-base font-medium ${
                      isActive
                        ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {/* Perfil */}
              <div className="flex items-center px-4 mb-4">
                <User className="w-5 h-5 mr-3 text-gray-500" />
                <div className="flex-1">
                  <div className="text-base font-medium text-gray-800">
                    {session.user?.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs">
                      {isAdmin ? "Administrador" : "Garçom"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="px-4 space-y-2">
                {isAdmin && (
                  <CloseShiftButton onClose={() => setMobileMenuOpen(false)} />
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

