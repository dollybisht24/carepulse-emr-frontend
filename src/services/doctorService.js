import api from './api';

export const doctorService = {
  getDoctors: async (params = {}) => {
    const res = await api.get('/doctors', { params });
    return res.data || [];
  },

  getDoctorById: async (id) => {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },

  createDoctor: async (data) => {
    const res = await api.post('/doctors', data);
    return res.data;
  },

  getDepartments: async () => {
    const res = await api.get('/departments');
    return res.data || [];
  },

  getSchedule: async (doctorId) => {
    const res = await api.get(`/schedules/${doctorId}`);
    return res.data;
  },

  configureSchedule: async (data) => {
    const res = await api.post('/schedules', data);
    return res.data;
  },

  getSlots: async (doctorId, date) => {
    const res = await api.get('/slots', {
      params: { doctorId, date },
    });
    return res.data;
  },
};
