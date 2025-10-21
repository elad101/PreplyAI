import axios, { AxiosError } from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HTTP-only cookies
});

// Request interceptor to add Firebase ID token
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = (error.response.data as any)?.message || 'An error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response from server. Please check your connection.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(error);
    }
  }
);

// API endpoints
export const api = {
  // Auth
  auth: {
    signInWithFirebase: async (idToken: string) => {
      const response = await apiClient.post('/auth/firebase', { idToken });
      return response.data;
    },
    signOut: async () => {
      const response = await apiClient.post('/auth/signout');
      return response.data;
    },
    getProfile: async () => {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    },
  },

  // Meetings
  meetings: {
    list: async (from?: string, to?: string) => {
      // Default to next 7 days if no dates provided
      const defaultFrom = from || new Date().toISOString();
      const defaultTo = to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await apiClient.get(`/meetings?from=${defaultFrom}&to=${defaultTo}`);
      return response.data.meetings; // Extract meetings array from response
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/meetings/${id}`);
      console.log('📡 API: Meeting response:', response.data);
      
      // Handle different response structures
      let meetingData;
      if (response.data.meeting) {
        // Backend returns { meeting, ai }
        meetingData = response.data.meeting;
        if (response.data.ai) {
          meetingData.briefing = response.data.ai;
        }
      } else {
        // Direct meeting object
        meetingData = response.data;
      }
      
      console.log('📡 API: Processed meeting data:', meetingData);
      return meetingData;
    },
        generate: async (id: string) => {
          console.log('🔗 API: Generating briefing for meeting:', id);
          const response = await apiClient.post(`/meetings/${id}/generate`);
          console.log('📡 API: Briefing generation response:', response.data);
          return response.data;
        },
  },

  // Settings
  settings: {
    get: async () => {
      const response = await apiClient.get('/settings');
      return response.data;
    },
    update: async (data: any) => {
      const response = await apiClient.patch('/settings', data);
      return response.data;
    },
  },
};

