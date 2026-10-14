import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  ClipboardList,
  Clock,
  ShieldAlert,
  FileText,
  X,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Sidebar = ({ isOpenMobile, onCloseMobile }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist';
  const isDoctor = user?.role === 'doctor';

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-hospital-600 text-white shadow-sm shadow-hospital-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar: Drawer on mobile, static on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:min-h-[calc(100vh-4rem)] ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Drawer Header with Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 md:hidden">
            <span className="font-bold text-sm text-slate-800">Navigation Menu</span>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Navigation */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Main Menu
            </p>
            <nav className="space-y-1">
              <NavLink to="/" end className={navItemClass} onClick={handleLinkClick}>
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/scheduler" className={navItemClass} onClick={handleLinkClick}>
                <CalendarDays className="w-4 h-4 flex-shrink-0" />
                <span>Appointment Scheduler</span>
              </NavLink>

              {(isAdmin || isReceptionist) && (
                <NavLink to="/book" className={navItemClass} onClick={handleLinkClick}>
                  <PlusCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Book Appointment</span>
                </NavLink>
              )}

              <NavLink to="/appointments" className={navItemClass} onClick={handleLinkClick}>
                <ClipboardList className="w-4 h-4 flex-shrink-0" />
                <span>{isDoctor ? 'My Patients Queue' : 'Appointments Registry'}</span>
              </NavLink>
            </nav>
          </div>

          {/* Administration Section (Admin only) */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Hospital Operations
              </p>
              <nav className="space-y-1">
                <NavLink to="/admin/schedules" className={navItemClass} onClick={handleLinkClick}>
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Doctor Schedules</span>
                </NavLink>

                <NavLink to="/admin/audit-logs" className={navItemClass} onClick={handleLinkClick}>
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>Audit Logs</span>
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl mt-4">
          <div className="flex items-center gap-2 text-slate-700">
            <FileText className="w-4 h-4 text-hospital-600 flex-shrink-0" />
            <span className="text-xs font-semibold">Swagger API</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Interactive API documentation & sandbox</p>
          <a
            href="http://localhost:5000/api/v1/docs"
            target="_blank"
            rel="noreferrer"
            className="mt-2 block text-center text-xs font-semibold text-hospital-600 hover:text-hospital-700 bg-white py-1 rounded border border-slate-200"
          >
            Open API Docs &rarr;
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
