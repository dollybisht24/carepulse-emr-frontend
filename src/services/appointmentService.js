import api from './api';

export const appointmentService = {
  getStats: async () => {
    const res = await api.get('/appointments/stats');
    return res.data;
  },

  list: async (params = {}) => {
    const res = await api.get('/appointments', { params });
    return {
      appointments: res.data || [],
      meta: res.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  getById: async (id) => {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  book: async (data) => {
    const res = await api.post('/appointments', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/appointments/${id}`, data);
    return res.data;
  },

  cancel: async (id, reason) => {
    const res = await api.delete(`/appointments/${id}`, { data: { reason } });
    return res.data;
  },

  markArrived: async (id) => {
    const res = await api.post(`/appointments/${id}/arrive`);
    return res.data;
  },

  complete: async (id, consultationNotes) => {
    const res = await api.post(`/appointments/${id}/complete`, { consultationNotes });
    return res.data;
  },
};
