import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, User, Phone, Calendar } from 'lucide-react';
import Modal from '../common/Modal';
import { patientService } from '../../services/patientService';

const PatientSearchModal = ({ isOpen, onClose, onSelectPatient }) => {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Register Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    gender: 'male',
    dateOfBirth: '1995-01-01',
    bloodGroup: 'Unknown',
    address: '',
    emergencyContact: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setIsRegisterMode(false);
      setRegisterError('');
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await patientService.search(query);
        setPatients(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    try {
      const newPatient = await patientService.create(formData);
      onSelectPatient(newPatient);
      onClose();
    } catch (err) {
      setRegisterError(err.message || 'Failed to register patient');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegisterMode ? 'Register New Patient' : 'Select or Search Patient'}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Toggle between search & register */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setIsRegisterMode(false)}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              !isRegisterMode
                ? 'border-hospital-600 text-hospital-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Search Existing Patient
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterMode(true)}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              isRegisterMode
                ? 'border-hospital-600 text-hospital-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            + New Patient Registration
          </button>
        </div>

        {!isRegisterMode ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by patient name, mobile, or ID (e.g. PAT-2026-1001)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-500">Searching patient database...</div>
              ) : patients.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No patients found matching your search. Click '+ New Patient Registration' above.
                </div>
              ) : (
                patients.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => {
                      onSelectPatient(p);
                      onClose();
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                        <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {p.patientId}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {p.mobile}
                        </span>
                        <span className="capitalize">{p.gender}</span>
                        {p.bloodGroup && <span>Blood: {p.bloodGroup}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-semibold text-hospital-600 bg-hospital-50 rounded border border-hospital-200 hover:bg-hospital-100"
                    >
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            {registerError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {registerError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-hospital-500"
                placeholder="e.g. Johnathan Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-hospital-500"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-hospital-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-hospital-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-hospital-500"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-hospital-500"
                placeholder="e.g. 12 Lake View Road"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-hospital-600 hover:bg-hospital-700 rounded-lg shadow-sm"
              >
                Register & Select
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default PatientSearchModal;
