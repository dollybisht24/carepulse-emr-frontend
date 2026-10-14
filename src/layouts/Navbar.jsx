import React from 'react';
import { Activity, LogOut, User, Shield, Stethoscope, ClipboardCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Super Admin
          </span>
        );
      case 'doctor':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
            <Stethoscope className="w-3 h-3 text-emerald-600" />
            Doctor
          </span>
        );
      case 'receptionist':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
            <ClipboardCheck className="w-3 h-3 text-sky-600" />
            Receptionist
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-hospital-600 to-sky-400 flex items-center justify-center shadow-sm">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-base text-slate-900 tracking-tight">CarePulse EMR</span>
          <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Hospital System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time sync indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Sync</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
            <div className="mt-1 flex justify-end">{getRoleBadge(user?.role)}</div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
