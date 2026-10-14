import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Search, Filter, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import api from '../services/api';

const AuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, actionFilter],
    queryFn: async () => {
      const res = await api.get('/audit-logs', {
        params: { page, limit: 15, action: actionFilter || undefined },
      });
      return {
        logs: res.data || [],
        meta: res.meta || { page: 1, limit: 15, total: 0, totalPages: 1 },
      };
    },
  });

  const logs = data?.logs || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  const getActionBadge = (action) => {
    switch (action) {
      case 'APPOINTMENT_CREATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">APPOINTMENT CREATED</span>;
      case 'APPOINTMENT_CANCELLED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">APPOINTMENT CANCELLED</span>;
      case 'PATIENT_ARRIVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">PATIENT ARRIVED</span>;
      case 'APPOINTMENT_COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">APPOINTMENT COMPLETED</span>;
      case 'LOGIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">USER LOGIN</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-hospital-600 flex-shrink-0" />
            <span>Hospital Operations Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, append-only log of logins, slot reservations, cancellations, and clinical updates.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          Total Audit Records: <strong className="text-slate-800">{meta.total}</strong>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Filter Event:</label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
          >
            <option value="">All Actions</option>
            <option value="APPOINTMENT_CREATED">Appointment Created</option>
            <option value="APPOINTMENT_CANCELLED">Appointment Cancelled</option>
            <option value="PATIENT_ARRIVED">Patient Arrived</option>
            <option value="APPOINTMENT_COMPLETED">Appointment Completed</option>
            <option value="LOGIN">User Login</option>
            <option value="DOCTOR_CREATED">Doctor Created</option>
            <option value="SCHEDULE_CONFIGURED">Schedule Configured</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No audit records found.</div>
        ) : (
          <>
            {/* Mobile Cards (< md:) */}
            <div className="md:hidden divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log._id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {getActionBadge(log.action)}
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{log.userId?.name || log.userEmail || 'System'}</span>
                      <span className="ml-1.5 text-[10px] font-bold text-slate-500 uppercase">({log.role})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">{log.entityType}</span>
                  </div>

                  <div className="text-[11px] font-mono bg-slate-50 p-2 rounded-lg text-slate-600 break-all">
                    {JSON.stringify(log.details)}
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (>= md:) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Change Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{log.userId?.name || log.userEmail || 'System'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.userId?.email || ''}</div>
                      </td>
                      <td className="py-3 px-4 uppercase font-bold text-[10px] text-slate-600">
                        {log.role}
                      </td>
                      <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {log.entityType} {log.entityId && <span className="font-mono text-[10px] text-slate-400">({log.entityId.slice(-6)})</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page <strong>{meta.page}</strong> of <strong>{meta.totalPages || 1}</strong>
          </span>
          <div className="flex gap-1">
            <button
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
