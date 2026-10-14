import React from 'react';
import { Activity, LogOut, Shield, Stethoscope, ClipboardCheck, Menu, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            <span className="hidden xs:inline">Super</span> Admin
          </span>
        );
      case 'doctor':
        return (
          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
            <Stethoscope className="w-3 h-3 text-emerald-600" />
            Doctor
          </span>
        );
      case 'receptionist':
        return (
          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
            <ClipboardCheck className="w-3 h-3 text-sky-600" />
            Receptionist
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3.5 sm:px-6 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-hospital-600 to-sky-400 flex items-center justify-center shadow-sm flex-shrink-0">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">CarePulse EMR</span>
          <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Hospital System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Real-time sync indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Sync</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800 leading-none max-w-[120px] sm:max-w-none truncate">
              {user?.name}
            </p>
            <div className="mt-1 flex justify-end">{getRoleBadge(user?.role)}</div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
