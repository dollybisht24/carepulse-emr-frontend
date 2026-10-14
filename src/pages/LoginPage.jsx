import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, Shield, Stethoscope, ClipboardCheck, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-hospital-950 flex flex-col justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-hospital-500 to-sky-400 shadow-xl shadow-hospital-500/20 mb-3 sm:mb-4">
          <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">CarePulse EMR</h2>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400">Hospital Appointment Management System</p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-5 sm:px-10 shadow-2xl rounded-2xl border border-slate-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@hospital.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-hospital-600 hover:bg-hospital-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-hospital-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hospital.com', 'Admin@123')}
                className="w-full text-left px-3 py-2 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100 flex items-center justify-between text-xs text-purple-900 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  Super Admin
                </span>
                <span className="text-[10px] text-purple-600 font-mono">admin@hospital.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('receptionist@hospital.com', 'Recept@123')}
                className="w-full text-left px-3 py-2 rounded-lg border border-sky-200 bg-sky-50/60 hover:bg-sky-100 flex items-center justify-between text-xs text-sky-900 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <ClipboardCheck className="w-3.5 h-3.5 text-sky-600" />
                  Receptionist
                </span>
                <span className="text-[10px] text-sky-600 font-mono">receptionist@hospital.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('doctor.smith@hospital.com', 'Doctor@123')}
                className="w-full text-left px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 flex items-center justify-between text-xs text-emerald-900 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  Dr. Smith (Cardiology)
                </span>
                <span className="text-[10px] text-emerald-600 font-mono">doctor.smith@hospital.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
