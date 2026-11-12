import api from './api';

export const getWorkOrders = async (params = {}) => {
  const res = await api.get('/maintenance/work-orders', { params });
  return res.data.data;
};

export const createWorkOrder = async (data) => {
  const res = await api.post('/maintenance/work-orders', data);
  return res.data.data;
};

export const getWorkOrderById = async (id) => {
  const res = await api.get(`/maintenance/work-orders/${id}`);
  return res.data.data;
};

export const moveWorkOrderStatus = async (id, statusData) => {
  const res = await api.patch(`/maintenance/work-orders/${id}/move`, statusData);
  return res.data.data;
};

export const approveWorkOrder = async (id, notes) => {
  const res = await api.post(`/maintenance/work-orders/${id}/approve`, { notes });
  return res.data.data;
};

export const rejectWorkOrder = async (id, reason) => {
  const res = await api.post(`/maintenance/work-orders/${id}/reject`, { reason });
  return res.data.data;
};

export const verifyClosure = async (id, notes) => {
  const res = await api.post(`/maintenance/work-orders/${id}/verify-closure`, { notes });
  return res.data.data;
};

export const getCalendarEvents = async () => {
  const res = await api.get('/maintenance/calendar');
  return res.data.data;
};
