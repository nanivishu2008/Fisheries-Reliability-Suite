import api from './api';

export const runPredictionEvaluation = async (assetId = null) => {
  const res = await api.post('/predictions/run-evaluation', { assetId });
  return res.data.data;
};

export const getPredictions = async (params = {}) => {
  const res = await api.get('/predictions', { params });
  return res.data.data;
};

export const getRecommendations = async (params = {}) => {
  const res = await api.get('/recommendations', { params });
  return res.data.data;
};

export const acceptRecommendation = async (id, notes = '') => {
  const res = await api.post(`/recommendations/${id}/accept`, { notes });
  return res.data.data;
};

export const rejectRecommendation = async (id, reason) => {
  const res = await api.post(`/recommendations/${id}/reject`, { reason });
  return res.data.data;
};

export const overrideRecommendation = async (id, overrideData) => {
  const res = await api.post(`/recommendations/${id}/override`, overrideData);
  return res.data.data;
};
