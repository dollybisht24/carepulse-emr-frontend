import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  UserCheck,
  CheckCircle2,
  Users,
  Stethoscope,
  PlusCircle,
  Calendar,
  AlertCircle,
  FileEdit,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { appointmentService } from '../services/appointmentService';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/appointments/StatusBadge';
import Modal from '../components/common/Modal';

const DashboardPage = () => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const isReceptionist = user?.role === 'receptionist';
  const isAdmin = user?.role === 'admin';

  // Notes Modal state for doctor quick completion
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [notes, setNotes] = useState('');
  const [completing, setCompleting] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => appointmentService.getStats(),
  });

  const handleMarkArrived = async (id) => {
    try {
      await appointmentService.markArrived(id);
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setCompleting(true);
    try {
      await appointmentService.complete(selectedAppt._id, notes);
      setSelectedAppt(null);
      setNotes('');
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isDoctor
              ? `You are viewing your assigned patients for ${user?.doctor?.departmentId?.name || 'Department'}.`
              : 'Real-time hospital appointment operations and patient queue overview.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {(isAdmin || isReceptionist) && (
            <Link
              to="/book"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-hospital-600 hover:bg-hospital-700 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          )}
          <Link
            to="/scheduler"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>View Scheduler</span>
          </Link>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={isLoading ? '...' : stats?.todayCount || 0}
          icon={CalendarDays}
          color="blue"
          subtitle="Scheduled for today"
        />
        <StatCard
          title="Scheduled (Pending)"
          value={isLoading ? '...' : stats?.scheduledCount || 0}
          icon={Clock}
          color="indigo"
          subtitle="Upcoming today"
        />
        <StatCard
          title="Arrived (In Queue)"
          value={isLoading ? '...' : stats?.arrivedCount || 0}
          icon={UserCheck}
          color="amber"
          subtitle="Waiting in reception"
        />
        <StatCard
          title="Completed Consults"
          value={isLoading ? '...' : stats?.completedCount || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully discharged"
        />
      </div>

      {/* Today's Priority Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isDoctor ? "Today's Patient Queue" : "Today's Scheduled & Arrived Patients"}
            </h3>
            <p className="text-xs text-slate-500">Live synchronized patient flow</p>
          </div>
          <Link to="/appointments" className="text-xs font-semibold text-hospital-600 hover:text-hospital-700">
            View All Appointments &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading live queue...</div>
          ) : stats?.upcomingAppointments?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No appointments pending or arrived for today.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Patient</th>
                  {!isDoctor && <th className="py-3 px-4">Doctor & Dept</th>}
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.upcomingAppointments?.map((appt) => {
                  const startTime = new Date(appt.startAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const endTime = new Date(appt.endAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={appt._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {startTime} - {endTime}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{appt.patientId?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {appt.patientId?.patientId} | {appt.patientId?.mobile}
                        </div>
                      </td>
                      {!isDoctor && (
                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-medium">{appt.doctorId?.userId?.name}</div>
                          <div className="text-[11px] text-slate-400">{appt.departmentId?.name}</div>
                        </td>
                      )}
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                        {appt.purpose}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {/* Receptionist Arrive action */}
                        {(isReceptionist || isAdmin) && appt.status === 'scheduled' && (
                          <button
                            onClick={() => handleMarkArrived(appt._id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                          >
                            Mark Arrived
                          </button>
                        )}

                        {/* Doctor Complete & Notes action */}
                        {(isDoctor || isAdmin) && ['scheduled', 'arrived'].includes(appt.status) && (
                          <button
                            onClick={() => {
                              setSelectedAppt(appt);
                              setNotes(appt.consultationNotes || '');
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Consultation Notes Modal */}
      <Modal
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title={`Complete Consultation - ${selectedAppt?.patientId?.name}`}
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <p><strong>Patient ID:</strong> {selectedAppt?.patientId?.patientId}</p>
            <p><strong>Chief Complaint:</strong> {selectedAppt?.purpose}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Doctor Consultation Notes & Prescription
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record clinical observations, diagnosis, medications prescribed, and follow-up advice..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedAppt(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={completing}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              {completing ? 'Completing...' : 'Mark Consultation Completed'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
