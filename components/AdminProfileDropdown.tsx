"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, ChevronDown, LogOut } from "lucide-react";
import { CloseShiftButton } from "./CloseShiftButton";

interface AdminProfileDropdownProps {
  onClose?: () => void;
  inMobileMenu?: boolean;
}

export function AdminProfileDropdown({ onClose, inMobileMenu = false }: AdminProfileDropdownProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors w-full md:w-auto"
      >
        <div className="flex items-center space-x-2 flex-1">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">
              {session?.user?.name}
            </div>
            <div className="text-xs text-gray-500">Administrador</div>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop para mobile (apenas se não estiver dentro do menu mobile) */}
          {!inMobileMenu && (
            <div
              className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
          )}
          {/* Dropdown */}
          <div className={`${inMobileMenu ? 'relative' : 'absolute right-0 mt-2'} w-full md:w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}>
            <div className="py-1">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="text-sm font-medium text-gray-900">
                  {session?.user?.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {session?.user?.email}
                </div>
              </div>
              <div className="px-2 py-2 space-y-2">
                <CloseShiftButton onClose={() => {
                  setIsOpen(false);
                  onClose?.();
                }} />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                    signOut();
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

