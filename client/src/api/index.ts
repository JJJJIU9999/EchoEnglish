import axios from 'axios';
import type {
  User, Corpus, Sentence, LearningRecord, LearningStats,
  Vocabulary, ApiResponse, PaginatedResponse,
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('echo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('echo_token');
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const authAPI = {
  register: (data: { email: string; password: string; nickname: string }) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', data),
  me: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
};

// ── Corpus ──
export const corpusAPI = {
  list: (params?: { scenario?: string; difficulty?: number; page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Corpus>>>('/corpus', { params }),
  detail: (id: number) =>
    api.get<ApiResponse<{ corpus: Corpus; sentences: Sentence[] }>>(`/corpus/${id}`),
};

// ── Learning ──
export const learningAPI = {
  createRecord: (data: {
    corpus_id: number;
    total_sentences: number;
    correct_sentences: number;
    accuracy: number;
    duration_seconds: number;
  }) => api.post<ApiResponse<{ record: LearningRecord }>>('/learning/records', data),
  getRecords: (params?: { corpus_id?: number; page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<LearningRecord>>>('/learning/records', { params }),
  getStats: () => api.get<ApiResponse<LearningStats>>('/learning/stats'),
};

// ── Vocabulary ──
export const vocabularyAPI = {
  add: (data: { word: string; definition: string; sentence_id?: number }) =>
    api.post<ApiResponse<{ vocabulary: Vocabulary }>>('/vocabulary', data),
  list: (params?: { mastery_level?: number }) =>
    api.get<ApiResponse<{ list: Vocabulary[] }>>('/vocabulary', { params }),
  update: (id: number, data: { mastery_level: number }) =>
    api.patch<ApiResponse<{ vocabulary: Vocabulary }>>(`/vocabulary/${id}`, data),
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/vocabulary/${id}`),
};
