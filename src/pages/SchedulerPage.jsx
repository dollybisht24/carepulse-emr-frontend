import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Stethoscope, Clock, PlusCircle, Building2 } from 'lucide-react';
import { doctorService } from '../services/doctorService';
import SlotGrid from '../components/scheduler/SlotGrid';
import useAuth from '../hooks/useAuth';

const SchedulerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canBook = user?.role === 'admin' || user?.role === 'receptionist';

  // Date defaults to today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  // Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => doctorService.getDepartments(),
  });

  // Fetch Doctors with department filter
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors', selectedDepartment],
    queryFn: () => doctorService.getDoctors({ departmentId: selectedDepartment }),
  });

  // Set default doctor when list loads
  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      // If user is a doctor, default to themselves
      if (user?.role === 'doctor' && user?.doctorId) {
        setSelectedDoctorId(user.doctorId);
      } else {
        setSelectedDoctorId(doctors[0]._id);
      }
    }
  }, [doctors, selectedDoctorId, user]);

  // Fetch Dynamic Slots for selected Doctor and Date
  const { data: slotData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', selectedDoctorId, selectedDate],
    queryFn: () => doctorService.getSlots(selectedDoctorId, selectedDate),
    enabled: !!selectedDoctorId && !!selectedDate,
  });

  // Selected doctor object
  const currentDoctor = doctors.find((d) => d._id === selectedDoctorId);

  const handleSlotClick = (slot) => {
    if (!canBook) return;
    // Navigate to booking page with query params prefilled
    navigate(`/book?doctorId=${selectedDoctorId}&departmentId=${currentDoctor?.departmentId?._id || ''}&startAt=${encodeURIComponent(slot.startAt)}&endAt=${encodeURIComponent(slot.endAt)}&date=${selectedDate}`);
  };

  const handleQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-hospital-600 flex-shrink-0" />
            Interactive Appointment Scheduler
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time doctor working hours, break periods, and atomic slot reservation grid.
          </p>
        </div>

        {canBook && (
          <button
            onClick={() => navigate('/book')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-hospital-600 hover:bg-hospital-700 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        )}
      </div>

      {/* Control Panel: Filters for Department, Doctor, Date */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Department Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Filter Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedDoctorId('');
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
          >
            <option value="">All Hospital Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
            Select Doctor
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
          >
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.userId?.name} ({doc.specialization})
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector with Quick Pills */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Appointment Date
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleQuickDate(0)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  selectedDate === todayStr
                    ? 'bg-hospital-50 text-hospital-700 border-hospital-300 font-semibold'
                    : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(1)}
                className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Tomorrow
              </button>
            </div>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Doctor Summary Card */}
      {currentDoctor && (
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{currentDoctor.userId?.name}</h2>
              <p className="text-xs text-sky-300">
                {currentDoctor.specialization} &bull; {currentDoctor.departmentId?.name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Room: <span className="text-slate-200 font-medium">{currentDoctor.roomNumber}</span> &bull; Fee: <span className="text-slate-200 font-medium">₹{currentDoctor.consultationFee}</span>
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-300 sm:text-right bg-white/5 p-3 rounded-xl border border-white/10">
            <p className="text-[11px] text-slate-400">Selected Schedule Date</p>
            <p className="font-semibold text-white mt-0.5">
              {new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}

      {/* Slot Matrix Visualizer */}
      {slotsLoading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-hospital-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Computing dynamic slot matrix & breaks...</p>
        </div>
      ) : (
        <SlotGrid
          slotData={slotData}
          onSelectSlot={handleSlotClick}
        />
      )}
    </div>
  );
};

export default SchedulerPage;
