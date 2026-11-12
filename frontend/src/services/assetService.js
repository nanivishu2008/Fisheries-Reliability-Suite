import api from './api';

export const getAssets = async (params = {}) => {
  const res = await api.get('/assets', { params });
  return res.data.data;
};

export const getAssetStats = async () => {
  const res = await api.get('/assets/stats');
  return res.data.data;
};

export const getAssetById = async (id) => {
  const res = await api.get(`/assets/${id}`);
  return res.data.data;
};

export const createAsset = async (data) => {
  const res = await api.post('/assets', data);
  return res.data.data;
};

export const updateAsset = async (id, data) => {
  const res = await api.put(`/assets/${id}`, data);
  return res.data.data;
};

export const deleteAsset = async (id) => {
  const res = await api.delete(`/assets/${id}`);
  return res.data;
};

export const patchAssetStatus = async (id, statusData) => {
  const res = await api.patch(`/assets/${id}/status`, statusData);
  return res.data.data;
};

export const recordTelemetry = async (data) => {
  const res = await api.post('/telemetry', data);
  return res.data.data;
};

export const getTelemetryTrends = async (assetId, params = {}) => {
  const res = await api.get(`/telemetry/${assetId}/trends`, { params });
  return res.data.data;
};

export const recordBreakdown = async (data) => {
  const res = await api.post('/breakdowns', data);
  return res.data.data;
};

export const getBreakdowns = async (params = {}) => {
  const res = await api.get('/breakdowns', { params });
  return res.data.data;
};

export const createInspection = async (data) => {
  const res = await api.post('/inspections', data);
  return res.data.data;
};

export const getInspections = async (params = {}) => {
  const res = await api.get('/inspections', { params });
  return res.data.data;
};
