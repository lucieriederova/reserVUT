import axios from 'axios';
import { supabase } from './supabase';

export type AppRole = 'Student' | 'CEO' | 'Guide' | 'Head Admin';

export interface AppUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'CEO' | 'GUIDE' | 'HEAD_ADMIN';
  isVerified: boolean;
}

export interface ReservationRecord {
  id: string;
  roomName: string;
  startTime: string;
  endTime: string;
  priorityLevel: number;
  type: string;
  userId: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const normalizeApiBaseUrl = (value?: string) => {
  const fallback = 'http://localhost:5001/api';
  if (!value) return fallback;

  // Accept accidental format like "VITE_API_URL=https://...".
  const withoutKey = value.startsWith('VITE_API_URL=') ? value.slice('VITE_API_URL='.length) : value;
  const trimmed = withoutKey.trim().replace(/\/+$/, '');
  if (!trimmed) return fallback;

  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  headers: {
    'Content-Type': 'application/json'
  }
});

export const rolePriority: Record<AppRole, number> = {
  Student: 1,
  CEO: 2,
  Guide: 3,
  'Head Admin': 4
};

export const login = async (email: string, password: string, role: AppRole) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }

  const { data } = await api.post<AppUser>('/auth/login', { email, role });
  return data;
};

export const logout = async () => {
  await supabase.auth.signOut();
};

export const fetchReservations = async () => {
  const { data } = await api.get<ReservationRecord[]>('/reservations');
  return data;
};

export interface CreateReservationInput {
  userId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  priorityLevel: number;
  type: string;
}

export const createReservation = async (payload: CreateReservationInput) => {
  const { data } = await api.post<ReservationRecord>('/reservations', payload);
  return data;
};
