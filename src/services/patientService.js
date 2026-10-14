import api from './api';

export const patientService = {
  search: async (query = '') => {
    const res = await api.get('/patients/search', { params: { q: query } });
    return res.data || [];
  },

  getById: async (id) => {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/patients', data);
    return res.data;
  },
};
