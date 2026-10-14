import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Stethoscope, Plus, UserPlus, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { doctorService } from '../services/doctorService';
import Modal from '../components/common/Modal';

const DoctorScheduleManagePage = () => {
  const queryClient = useQueryClient();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Doctor Creation Form
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: 'Doctor@123',
    departmentId: '',
    specialization: '',
    roomNumber: 'OPD-101',
    consultationFee: 600,
  });

  // Schedule Config State
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri
  const [slotDuration, setSlotDuration] = useState(15);
  const [sessions, setSessions] = useState([
    { sessionName: 'Morning Session', startTime: '09:00', endTime: '12:00' },
    { sessionName: 'Afternoon Session', startTime: '13:00', endTime: '17:00' },
  ]);
  const [breaks, setBreaks] = useState([
    { breakName: 'Lunch Break', startTime: '12:00', endTime: '13:00' },
  ]);

  // Fetch doctors & departments
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorService.getDoctors(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => doctorService.getDepartments(),
  });

  // Fetch schedule for selected doctor
  const { data: currentSchedule } = useQuery({
    queryKey: ['schedule', selectedDoctorId],
    queryFn: async () => {
      if (!selectedDoctorId) return null;
      const res = await doctorService.getSchedule(selectedDoctorId);
      if (res) {
        setWorkingDays(res.workingDays || [1, 2, 3, 4, 5]);
        setSlotDuration(res.slotDuration || 15);
        if (res.sessions?.length) setSessions(res.sessions);
        if (res.breaks?.length) setBreaks(res.breaks);
      }
      return res;
    },
    enabled: !!selectedDoctorId,
  });

  // Save Schedule Mutation
  const saveScheduleMutation = useMutation({
    mutationFn: (payload) => doctorService.configureSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', selectedDoctorId] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      setNotification({ type: 'success', message: 'Doctor schedule successfully saved and updated!' });
    },
    onError: (err) => {
      setNotification({ type: 'error', message: err.message || 'Failed to save schedule.' });
    },
  });

  // Create Doctor Mutation
  const createDoctorMutation = useMutation({
    mutationFn: (payload) => doctorService.createDoctor(payload),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setIsDoctorModalOpen(false);
      setSelectedDoctorId(newDoc._id);
      setNotification({ type: 'success', message: `Doctor ${newDoc.userId?.name} created successfully!` });
    },
    onError: (err) => {
      setNotification({ type: 'error', message: err.message || 'Failed to create doctor account.' });
    },
  });

  const handleDayToggle = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day].sort());
    }
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      alert('Please select a doctor');
      return;
    }
    saveScheduleMutation.mutate({
      doctorId: selectedDoctorId,
      workingDays,
      sessions,
      breaks,
      slotDuration: Number(slotDuration),
    });
  };

  const daysLabels = [
    { num: 0, label: 'Sun' },
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-hospital-600 flex-shrink-0" />
            <span>Doctor Working Hours & Schedule Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure working days, morning/afternoon sessions, breaks, and slot durations.
          </p>
        </div>

        <button
          onClick={() => setIsDoctorModalOpen(true)}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-hospital-600 hover:bg-hospital-700 shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Doctor</span>
        </button>
      </div>

      {notification.message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Doctor Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-slate-400" />
          Select Doctor to Configure
        </label>
        <select
          value={selectedDoctorId}
          onChange={(e) => setSelectedDoctorId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
        >
          <option value="">-- Choose Doctor --</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.userId?.name} ({doc.specialization} &bull; {doc.departmentId?.name})
            </option>
          ))}
        </select>
      </div>

      {selectedDoctorId && (
        <form onSubmit={handleSaveSchedule} className="space-y-6">
          {/* Working Days */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Working Days of the Week</h3>
            <p className="text-xs text-slate-500">
              Select the days when the doctor is on duty for clinical consultations.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {daysLabels.map((d) => {
                const active = workingDays.includes(d.num);
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => handleDayToggle(d.num)}
                    className={`flex-1 sm:flex-none min-w-[50px] text-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-hospital-600 text-white shadow-sm ring-2 ring-hospital-400'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot Duration */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Consultation Slot Duration</h3>
            <p className="text-xs text-slate-500">
              Interval length used to divide sessions into bookable appointment slots.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {[15, 20, 30, 45, 60].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSlotDuration(dur)}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    slotDuration === dur
                      ? 'bg-hospital-50 text-hospital-700 border-hospital-400 ring-2 ring-hospital-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {dur} Min
                </button>
              ))}
            </div>
          </div>

          {/* Working Sessions */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Working Sessions</h3>
                <p className="text-xs text-slate-500">
                  Daily working blocks (e.g. Morning 09:00 - 12:00, Afternoon 13:00 - 17:00).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {sessions.map((session, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Session Name
                    </label>
                    <input
                      type="text"
                      value={session.sessionName}
                      onChange={(e) => {
                        const next = [...sessions];
                        next[idx].sessionName = e.target.value;
                        setSessions(next);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Start Time (HH:mm)
                    </label>
                    <input
                      type="time"
                      value={session.startTime}
                      onChange={(e) => {
                        const next = [...sessions];
                        next[idx].startTime = e.target.value;
                        setSessions(next);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      End Time (HH:mm)
                    </label>
                    <input
                      type="time"
                      value={session.endTime}
                      onChange={(e) => {
                        const next = [...sessions];
                        next[idx].endTime = e.target.value;
                        setSessions(next);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breaks */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configured Break Periods</h3>
              <p className="text-xs text-slate-500">
                Slots overlapping breaks will be automatically excluded by the slot generation engine.
              </p>
            </div>

            <div className="space-y-3">
              {breaks.map((brk, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Break Name
                    </label>
                    <input
                      type="text"
                      value={brk.breakName}
                      onChange={(e) => {
                        const next = [...breaks];
                        next[idx].breakName = e.target.value;
                        setBreaks(next);
                      }}
                      className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={brk.startTime}
                      onChange={(e) => {
                        const next = [...breaks];
                        next[idx].startTime = e.target.value;
                        setBreaks(next);
                      }}
                      className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={brk.endTime}
                      onChange={(e) => {
                        const next = [...breaks];
                        next[idx].endTime = e.target.value;
                        setBreaks(next);
                      }}
                      className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saveScheduleMutation.isPending}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-hospital-600 hover:bg-hospital-700 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {saveScheduleMutation.isPending ? 'Saving Schedule...' : 'Save & Publish Schedule'}
            </button>
          </div>
        </form>
      )}

      {/* New Doctor Account Modal */}
      <Modal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        title="Register New Doctor Account"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createDoctorMutation.mutate(newDoctor);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name *</label>
            <input
              type="text"
              required
              value={newDoctor.name}
              onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              placeholder="e.g. Dr. Robert Vance"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                placeholder="doctor.vance@hospital.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Password *</label>
              <input
                type="text"
                required
                value={newDoctor.password}
                onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={newDoctor.departmentId}
                onChange={(e) => setNewDoctor({ ...newDoctor, departmentId: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
              <input
                type="text"
                required
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                placeholder="e.g. Interventional Cardiologist"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                value={newDoctor.roomNumber}
                onChange={(e) => setNewDoctor({ ...newDoctor, roomNumber: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (₹)</label>
              <input
                type="number"
                value={newDoctor.consultationFee}
                onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDoctorModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDoctorMutation.isPending}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-hospital-600 hover:bg-hospital-700 rounded-lg shadow-sm"
            >
              {createDoctorMutation.isPending ? 'Creating Doctor...' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorScheduleManagePage;
