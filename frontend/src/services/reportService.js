import api from './api';

export const getReliabilityMetrics = async () => {
  const res = await api.get('/reports/metrics');
  return res.data.data;
};

export const submitReliabilityFeedback = async (data) => {
  const res = await api.post('/reports/feedback', data);
  return res.data;
};

export const getReportSummary = async (params = {}) => {
  const res = await api.get('/reports/summary', { params });
  return res.data.data;
};

export const downloadReportCsv = (reportType = 'asset_health') => {
  const url = `${api.defaults.baseURL}/reports/export-csv?reportType=${reportType}`;
  window.open(url, '_blank');
};

export const getUsers = async (params = {}) => {
  const res = await api.get('/users', { params });
  return res.data.data;
};

export const createUser = async (data) => {
  const res = await api.post('/users', data);
  return res.data.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data.data;
};

export const patchUserStatus = async (id, isActive) => {
  const res = await api.patch(`/users/${id}/status`, { isActive });
  return res.data.data;
};

export const getAuditLogs = async (params = {}) => {
  const res = await api.get('/audit-logs', { params });
  return res.data.data;
};

export const downloadAuditLogsCsv = () => {
  const url = `${api.defaults.baseURL}/audit-logs/export-csv`;
  window.open(url, '_blank');
};

export const getSettings = async () => {
  const res = await api.get('/settings');
  return res.data.data;
};

export const updateSetting = async (data) => {
  const res = await api.put('/settings', data);
  return res.data.data;
};

export const getSpareParts = async () => {
  const res = await api.get('/spare-parts');
  return res.data.data;
};

export const createSparePart = async (data) => {
  const res = await api.post('/spare-parts', data);
  return res.data.data;
};
