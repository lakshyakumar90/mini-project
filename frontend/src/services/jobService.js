import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3333/api'}/jobs`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const jobService = {
  getJobs: async ({ cursor = null, limit = 12, type = 'all', locationType = 'all', skills = null, search = '' }) => {
    let url = `/?limit=${limit}&type=${type}&locationType=${locationType}`;
    if (cursor) url += `&cursor=${cursor}`;
    if (skills) url += `&skills=${encodeURIComponent(skills)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await api.get(url);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/', jobData);
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  applyToJob: async (id, { coverNote, resume, additionalDocuments }) => {
    const formData = new FormData();
    if (coverNote) formData.append('coverNote', coverNote);
    if (resume) formData.append('resume', resume);
    if (additionalDocuments) {
      additionalDocuments.forEach(file => formData.append('additionalDocuments', file));
    }
    
    const response = await api.post(`/${id}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateApplicationStatus: async (id, applicationId, status) => {
    const response = await api.put(`/${id}/application/${applicationId}/status`, { status });
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  }
};

export default jobService;
