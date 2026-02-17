import axios from 'axios';

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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
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

export const login = async (email: string, role: AppRole) => {
  const { data } = await api.post<AppUser>('/auth/login', { email, role });
  return data;
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
