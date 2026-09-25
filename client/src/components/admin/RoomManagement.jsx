import React, { useState } from 'react';
import { Edit3, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import roomService from '../../services/roomService';

const initialForm = {
  roomNumber: '',
  roomType: 'Dorm',
  label: '',
  totalBeds: 4,
  pricePerNight: 500,
  status: 'Available',
  floor: 1,
  maxGuests: 4,
  description: '',
};

const RoomManagement = ({ rooms, onRefresh }) => {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: ['totalBeds', 'pricePerNight', 'floor', 'maxGuests'].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const startEdit = (room) => {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      label: room.label,
      totalBeds: room.totalBeds,
      pricePerNight: room.pricePerNight,
      status: room.status,
      floor: room.floor,
      maxGuests: room.maxGuests,
      description: room.description || '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingId) {
        await roomService.update(editingId, payload);
        toast.success('Room updated');
      } else {
        await roomService.create(payload);
        toast.success('Room created with beds');
      }
      resetForm();
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Delete room ${room.roomNumber} and its beds?`)) return;
    try {
      await roomService.delete(room._id);
      toast.success('Room deleted');
      if (editingId === room._id) resetForm();
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete room');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">
            {editingId ? 'Edit Room' : 'Create Room'}
          </h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-ghost text-sm">
              <X className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="form-label">Room number<input name="roomNumber" required value={form.roomNumber} onChange={updateField} className="form-input mt-1" /></label>
          <label className="form-label">Room type<select name="roomType" value={form.roomType} onChange={updateField} className="form-input mt-1"><option>Dorm</option><option>Private</option></select></label>
          <label className="form-label">Room label<input name="label" required value={form.label} onChange={updateField} className="form-input mt-1" /></label>
          <label className="form-label">Price / night<input name="pricePerNight" type="number" min="0" required value={form.pricePerNight} onChange={updateField} className="form-input mt-1" /></label>
          <label className="form-label">Total beds<input name="totalBeds" type="number" min="1" required value={form.totalBeds} onChange={updateField} className="form-input mt-1" /></label>
          <label className="form-label">Maximum guests<input name="maxGuests" type="number" min="1" required value={form.maxGuests} onChange={updateField} className="form-input mt-1" /></label>
          <label className="form-label">Floor<input name="floor" type="number" min="1" required value={form.floor} onChange={updateField} className="form-input mt-1" /></label>
          <label className="form-label">Status<select name="status" value={form.status} onChange={updateField} className="form-input mt-1"><option>Available</option><option>Cleaning</option><option>Maintenance</option></select></label>
          <label className="form-label sm:col-span-2 lg:col-span-4">Description<textarea name="description" maxLength="500" value={form.description} onChange={updateField} className="form-input mt-1 resize-none" rows="2" /></label>
        </div>
        <button type="submit" disabled={saving} className="btn-primary mt-4">
          {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {saving ? 'Saving...' : editingId ? 'Update Room' : 'Create Room'}
        </button>
      </form>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Room Inventory</h2>
        <div className="space-y-2">
          {rooms.map((room) => (
            <div key={room._id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <div className="flex-1 min-w-48">
                <p className="font-medium text-slate-800 dark:text-white">{room.roomNumber} · {room.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{room.roomType} · {room.totalBeds} beds · {room.pricePerNight} per night</p>
              </div>
              <span className={`badge ${room.status === 'Available' ? 'badge-green' : room.status === 'Cleaning' ? 'badge-yellow' : 'badge-gray'}`}>{room.status}</span>
              <button type="button" onClick={() => startEdit(room)} className="btn-secondary text-xs"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
              <button type="button" onClick={() => handleDelete(room)} className="btn-ghost text-xs text-red-500"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
