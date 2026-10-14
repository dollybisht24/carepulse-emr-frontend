import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Search,
  UserCheck,
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import PatientSearchModal from '../components/patients/PatientSearchModal';
import SlotGrid from '../components/scheduler/SlotGrid';

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // URL query params pre-fill support
  const urlDoctorId = searchParams.get('doctorId') || '';
  const urlDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const urlStartAt = searchParams.get('startAt') || '';
  const urlEndAt = searchParams.get('endAt') || '';

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(urlDoctorId);
  const [selectedDate, setSelectedDate] = useState(urlDate);
  const [selectedSlot, setSelectedSlot] = useState(
    urlStartAt ? { startAt: urlStartAt, endAt: urlEndAt } : null
  );
  const [purpose, setPurpose] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => doctorService.getDepartments(),
  });

  // Fetch doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors', selectedDepartmentId],
    queryFn: () => doctorService.getDoctors({ departmentId: selectedDepartmentId }),
  });

  // When doctors load, if urlDoctorId exists, select it
  useEffect(() => {
    if (urlDoctorId && doctors.some((d) => d._id === urlDoctorId)) {
      setSelectedDoctorId(urlDoctorId);
      const doc = doctors.find((d) => d._id === urlDoctorId);
      if (doc?.departmentId?._id) {
        setSelectedDepartmentId(doc.departmentId._id);
      }
    } else if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0]._id);
    }
  }, [doctors, urlDoctorId]);

  // Fetch slots for selected doctor & date
  const { data: slotData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', selectedDoctorId, selectedDate],
    queryFn: () => doctorService.getSlots(selectedDoctorId, selectedDate),
    enabled: !!selectedDoctorId && !!selectedDate,
  });

  const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId);

  // Booking Mutation with concurrency guard
  const bookMutation = useMutation({
    mutationFn: (payload) => appointmentService.book(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate('/appointments?booked=true');
    },
    onError: (err) => {
      setBookingError(err.message || 'Failed to book appointment. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedPatient) {
      setBookingError('Please select or register a patient first.');
      return;
    }
    if (!selectedDoctorId) {
      setBookingError('Please select a doctor.');
      return;
    }
    if (!selectedSlot) {
      setBookingError('Please select an available appointment slot.');
      return;
    }

    const departmentId =
      selectedDepartmentId || selectedDoctor?.departmentId?._id || departments[0]?._id;

    bookMutation.mutate({
      patientId: selectedPatient._id,
      doctorId: selectedDoctorId,
      departmentId,
      startAt: selectedSlot.startAt,
      endAt: selectedSlot.endAt,
      purpose,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-hospital-600 flex-shrink-0" />
          Book Patient Appointment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Atomic slot reservation ensures zero double-booking even across concurrent hospital receptionists.
        </p>
      </div>

      {bookingError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">Booking Could Not Be Completed</h4>
            <p className="text-xs mt-0.5">{bookingError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Step 1: Patient Selection */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-hospital-600" />
              Step 1: Patient Information
            </h3>
            <button
              type="button"
              onClick={() => setIsPatientModalOpen(true)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-hospital-600 bg-hospital-50 hover:bg-hospital-100 border border-hospital-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              {selectedPatient ? 'Change Patient' : 'Search / Register Patient'}
            </button>
          </div>

          {selectedPatient ? (
            <div className="flex items-center justify-between p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedPatient.name}</h4>
                  <p className="text-xs text-slate-600">
                    ID: <strong className="font-mono">{selectedPatient.patientId}</strong> &bull; Mobile: {selectedPatient.mobile} &bull; Blood: {selectedPatient.bloodGroup || 'N/A'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Selected
              </span>
            </div>
          ) : (
            <div
              onClick={() => setIsPatientModalOpen(true)}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-hospital-400 cursor-pointer transition-colors"
            >
              <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No Patient Selected</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click here to search by name or mobile number, or register a new patient.
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Doctor & Department Selection */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Stethoscope className="w-4 h-4 text-hospital-600" />
            Step 2: Doctor & Department
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => {
                  setSelectedDepartmentId(e.target.value);
                  setSelectedDoctorId('');
                  setSelectedSlot(null);
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Doctor *</label>
              <select
                required
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setSelectedSlot(null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
              >
                <option value="">Select Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.userId?.name} ({doc.specialization}) - Room {doc.roomNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Date & Slot Picker */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-hospital-600" />
              Step 3: Choose Appointment Slot
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-hospital-500"
              />
            </div>
          </div>

          {selectedSlot && (
            <div className="p-3 bg-hospital-50 border border-hospital-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-hospital-900">
                <CheckCircle2 className="w-4 h-4 text-hospital-600 flex-shrink-0" />
                <span className="truncate">
                  Selected:{' '}
                  <strong>
                    {new Date(selectedSlot.startAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(selectedSlot.endAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>{' '}
                  ({selectedDate})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="text-[11px] font-semibold text-hospital-700 underline flex-shrink-0 ml-2"
              >
                Clear
              </button>
            </div>
          )}

          {slotsLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Calculating available slots...</div>
          ) : (
            <SlotGrid
              slotData={slotData}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />
          )}
        </div>

        {/* Step 4: Purpose & Confirm */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-hospital-600" />
            Step 4: Purpose of Visit
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason / Symptoms *
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Chest tightness during morning walk, follow-up on hypertension medications..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-hospital-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/scheduler')}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookMutation.isPending || !selectedPatient || !selectedSlot}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-hospital-600 hover:bg-hospital-700 rounded-xl shadow-md shadow-hospital-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {bookMutation.isPending ? 'Confirming Reservation...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      </form>

      {/* Patient Search / Register Modal */}
      <PatientSearchModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSelectPatient={(patient) => setSelectedPatient(patient)}
      />
    </div>
  );
};

export default BookingPage;
