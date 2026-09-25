/**
 * services/roomService.js — Room API Calls
 */

import api from "./api";

const roomService = {
  getAll: async (filters = {}) => {
    const { data } = await api.get("/rooms", { params: filters });
    return data.data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/rooms/${id}`);
    return data.data;
  },

  checkAvailability: async (params) => {
    const { data } = await api.get("/rooms/availability", { params });
    return data.data;
  },

  getAdminGrid: async () => {
    const { data } = await api.get("/rooms/admin/grid");
    return data.data;
  },

  create: async (roomData) => {
    const { data } = await api.post("/rooms", roomData);
    return data.data;
  },

  update: async (id, roomData) => {
    const { data } = await api.put(`/rooms/${id}`, roomData);
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/rooms/${id}`);
    return data;
  },
};

export default roomService;
