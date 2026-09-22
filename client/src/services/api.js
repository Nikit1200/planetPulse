import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Health check
export const getHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Dashboard
export const getDashboardData = async () => {
  const response = await apiClient.get('/dashboard');
  return response.data;
};

// Weekly Target
export const getWeeklyTarget = async () => {
  const response = await apiClient.get('/target');
  return response.data;
};

export const updateWeeklyTarget = async (weeklyTarget) => {
  const response = await apiClient.put('/target', { weeklyTarget });
  return response.data;
};

// Activities
export const getActivities = async (params = {}) => {
  const response = await apiClient.get('/activities', { params });
  return response.data;
};

export const getActivityById = async (id) => {
  const response = await apiClient.get(`/activities/${id}`);
  return response.data;
};

export const createActivity = async (activityData) => {
  const response = await apiClient.post('/activities', activityData);
  return response.data;
};

export const deleteActivity = async (id) => {
  const response = await apiClient.delete(`/activities/${id}`);
  return response.data;
};

export default apiClient;
