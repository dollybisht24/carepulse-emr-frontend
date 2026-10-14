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
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Core Navigation */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            <NavLink to="/" end className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/scheduler" className={navItemClass}>
              <CalendarDays className="w-4 h-4" />
              <span>Appointment Scheduler</span>
            </NavLink>

            {(isAdmin || isReceptionist) && (
              <NavLink to="/book" className={navItemClass}>
                <PlusCircle className="w-4 h-4" />
                <span>Book Appointment</span>
              </NavLink>
            )}

            <NavLink to="/appointments" className={navItemClass}>
              <ClipboardList className="w-4 h-4" />
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
              <NavLink to="/admin/schedules" className={navItemClass}>
                <Clock className="w-4 h-4" />
                <span>Doctor Schedules</span>
              </NavLink>

              <NavLink to="/admin/audit-logs" className={navItemClass}>
                <ShieldAlert className="w-4 h-4" />
                <span>Audit Logs</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
        <div className="flex items-center gap-2 text-slate-700">
          <FileText className="w-4 h-4 text-hospital-600" />
          <span className="text-xs font-semibold">Swagger API</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Interactive API documentation & test sandbox</p>
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
  );
};

export default Sidebar;
