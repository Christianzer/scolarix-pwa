import api from './api';
import type { User } from '../types/auth';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  telephone_whatsapp?: string;
  telephone_whatsapp_parent?: string;
  password: string;
  password_confirmation: string;
}

const authService = {
  login(identifier: string, password: string) {
    return api.post<LoginResponse>('/auth/login', { identifier, password });
  },

  loginMatricule(matricule: string) {
    return api.post<LoginResponse>('/auth/login-matricule', { matricule });
  },

  register(data: RegisterData) {
    return api.post<{ message: string }>('/auth/register', data);
  },

  verifyOtp(email: string, otp: string) {
    return api.post<LoginResponse>('/auth/verify-otp', { email, otp });
  },

  resendOtp(email: string) {
    return api.post<{ message: string }>('/auth/resend-otp', { email });
  },

  forgotPassword(email: string) {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  },

  me() {
    return api.get<{ user: User }>('/auth/me');
  },

  refresh() {
    return api.post<{ token: string; user: User }>('/auth/refresh');
  },

  updateProfil(data: { nom?: string; prenom?: string; telephone?: string; telephone_whatsapp?: string }) {
    return api.put<{ message: string; user: User }>('/auth/profil', data);
  },

  updateAvatar(formData: FormData) {
    return api.post<{ message: string; avatar_url: string }>('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updatePassword(data: { current_password: string; password: string; password_confirmation: string }) {
    return api.put<{ message: string }>('/auth/password', data);
  },

  logout() {
    return api.post('/auth/logout');
  },
};

export default authService;
