import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import StatusBadge from '../components/appointments/StatusBadge';
import Modal from '../components/common/Modal';

const AppointmentListPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isDoctor = user?.role === 'doctor';
  const isReceptionist = user?.role === 'receptionist';
  const isAdmin = user?.role === 'admin';

  // Filter & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('startAt');
  const [order, setOrder] = useState('desc');

  // Modals
  const [notesAppt, setNotesAppt] = useState(null);
  const [notesText, setNotesText] = useState('');

  const [cancelAppt, setCancelAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('Patient requested cancellation');

  const [viewPatientAppt, setViewPatientAppt] = useState(null);

  // Fetch Doctors & Departments for filters
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorService.getDoctors(),
    enabled: !isDoctor,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => doctorService.getDepartments(),
  });

  // Fetch Appointments
  const { data, isLoading } = useQuery({
    queryKey: [
      'appointments',
      page,
      limit,
      search,
      status,
      doctorId,
      departmentId,
      startDate,
      endDate,
      sortBy,
      order,
    ],
    queryFn: () =>
      appointmentService.list({
        page,
        limit,
        search,
        status,
        doctorId: isDoctor ? undefined : doctorId,
        departmentId,
        startDate,
        endDate,
        sortBy,
        order,
      }),
  });

  const appointments = data?.appointments || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Status Action Handlers
  const handleArrive = async (id) => {
    try {
      await appointmentService.markArrived(id);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelAppt) return;
    try {
      await appointmentService.cancel(cancelAppt._id, cancelReason);
      setCancelAppt(null);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!notesAppt) return;
    try {
      await appointmentService.complete(notesAppt._id, notesText);
      setNotesAppt(null);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-hospital-600" />
            {isDoctor ? 'My Patients Appointment Queue' : 'Master Appointments Registry'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isDoctor
              ? 'Appointments assigned strictly to your doctor profile. Filter and complete visits.'
              : 'Server-side paginated, filterable appointment registry with real-time status transitions.'}
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
          Total Records: <strong className="text-slate-800">{meta.total}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search patient name, ID, mobile..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="arrived">Arrived (In Queue)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Doctor Filter (Admin/Receptionist only) */}
          {!isDoctor && (
            <div>
              <select
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
              >
                <option value="">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.userId?.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Department Filter */}
          <div>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter & Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-600">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
            />
            {(startDate || endDate || search || status || doctorId || departmentId) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatus('');
                  setDoctorId('');
                  setDepartmentId('');
                  setStartDate('');
                  setEndDate('');
                  setPage(1);
                }}
                className="text-hospital-600 font-semibold hover:underline ml-2"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sort:</span>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No appointments found matching your search and filter criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Patient</th>
                  {!isDoctor && <th className="py-3 px-4">Doctor & Dept</th>}
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Permitted Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => {
                  const dateStr = new Date(appt.startAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const timeStr = `${new Date(appt.startAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} - ${new Date(appt.endAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`;

                  return (
                    <tr key={appt._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{dateStr}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{timeStr}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div
                          onClick={() => setViewPatientAppt(appt)}
                          className="font-semibold text-hospital-700 hover:underline cursor-pointer"
                        >
                          {appt.patientId?.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {appt.patientId?.patientId} &bull; {appt.patientId?.mobile}
                        </div>
                      </td>

                      {!isDoctor && (
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{appt.doctorId?.userId?.name}</div>
                          <div className="text-[11px] text-slate-500">{appt.departmentId?.name}</div>
                        </td>
                      )}

                      <td className="py-3 px-4 max-w-xs text-slate-600">
                        <p className="truncate">{appt.purpose}</p>
                        {appt.consultationNotes && (
                          <p className="text-[11px] text-emerald-700 italic mt-0.5 truncate">
                            Note: {appt.consultationNotes}
                          </p>
                        )}
                        {appt.status === 'cancelled' && appt.cancelledReason && (
                          <p className="text-[11px] text-rose-600 mt-0.5 truncate">
                            Reason: {appt.cancelledReason}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={appt.status} />
                      </td>

                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        {/* Receptionist/Admin: Mark Arrived */}
                        {(isReceptionist || isAdmin) && appt.status === 'scheduled' && (
                          <button
                            type="button"
                            onClick={() => handleArrive(appt._id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                          >
                            Mark Arrived
                          </button>
                        )}

                        {/* Doctor/Admin: Complete Consultation & Notes */}
                        {(isDoctor || isAdmin) && ['scheduled', 'arrived'].includes(appt.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              setNotesAppt(appt);
                              setNotesText(appt.consultationNotes || '');
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          >
                            Complete
                          </button>
                        )}

                        {/* Cancel Action */}
                        {(isReceptionist || isAdmin || isDoctor) &&
                          ['scheduled', 'arrived'].includes(appt.status) && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelAppt(appt);
                                setCancelReason('Patient requested cancellation');
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                            >
                              Cancel
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded-lg text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>records per page</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Page <strong>{meta.page}</strong> of <strong>{meta.totalPages || 1}</strong>
            </span>
            <div className="flex gap-1">
              <button
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Appointment Modal */}
      <Modal
        isOpen={!!notesAppt}
        onClose={() => setNotesAppt(null)}
        title={`Complete Consultation - ${notesAppt?.patientId?.name}`}
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <p><strong>Patient ID:</strong> {notesAppt?.patientId?.patientId}</p>
            <p><strong>Chief Complaint:</strong> {notesAppt?.purpose}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Consultation Notes / Medication Advice
            </label>
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Diagnosis, prescribed treatment, medication dosage, lifestyle advice..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setNotesAppt(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Complete Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Appointment Modal */}
      <Modal
        isOpen={!!cancelAppt}
        onClose={() => setCancelAppt(null)}
        title="Confirm Appointment Cancellation"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            <p className="font-semibold">Warning: This will release the doctor's reserved slot!</p>
            <p className="mt-0.5">
              The slot will immediately become available for other patients to book in real-time.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cancellation Reason *
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCancelAppt(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Keep Appointment
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </Modal>

      {/* Patient Detail Modal */}
      <Modal
        isOpen={!!viewPatientAppt}
        onClose={() => setViewPatientAppt(null)}
        title={`Patient Record: ${viewPatientAppt?.patientId?.name}`}
      >
        {viewPatientAppt && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400">Patient ID:</span>
                <p className="font-mono font-bold text-slate-800">{viewPatientAppt.patientId?.patientId}</p>
              </div>
              <div>
                <span className="text-slate-400">Mobile:</span>
                <p className="font-bold text-slate-800">{viewPatientAppt.patientId?.mobile}</p>
              </div>
              <div>
                <span className="text-slate-400">Gender:</span>
                <p className="capitalize font-medium text-slate-800">{viewPatientAppt.patientId?.gender}</p>
              </div>
              <div>
                <span className="text-slate-400">Blood Group:</span>
                <p className="font-bold text-rose-600">{viewPatientAppt.patientId?.bloodGroup || 'Unknown'}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400">Appointment Purpose:</span>
              <p className="text-slate-800 font-medium mt-0.5">{viewPatientAppt.purpose}</p>
            </div>

            {viewPatientAppt.consultationNotes && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-emerald-800 font-semibold">Doctor's Consultation Notes:</span>
                <p className="text-emerald-900 mt-1 whitespace-pre-wrap">{viewPatientAppt.consultationNotes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentListPage;
