import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const apiInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - remove token and redirect to login
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
      return Promise.reject(error);
    }

    // Show error message if available
    const message = error.response?.data?.error || error.message || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Auth methods
  async register(data: { username: string; email: string; password: string }) {
    const response = await apiInstance.post('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await apiInstance.post('/auth/login', data);
    return response.data;
  },

  async logout() {
    const response = await apiInstance.post('/auth/logout');
    return response.data;
  },

  async getProfile() {
    const response = await apiInstance.get('/auth/profile');
    return response.data;
  },

  // Group methods
  async createGroup(data: { name: string; description?: string; isPrivate?: boolean }) {
    const response = await apiInstance.post('/groups', data);
    return response.data;
  },

  async getGroups() {
    const response = await apiInstance.get('/groups');
    return response.data;
  },

  async discoverGroups(search?: string, page: number = 1, limit: number = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (search) {
      params.append('search', search);
    }
    
    const response = await apiInstance.get(`/groups/discover?${params}`);
    return response.data;
  },

  async getGroup(groupId: string) {
    const response = await apiInstance.get(`/groups/${groupId}`);
    return response.data;
  },

  async joinGroup(groupId: string) {
    const response = await apiInstance.post(`/groups/${groupId}/join`);
    return response.data;
  },

  async leaveGroup(groupId: string) {
    const response = await apiInstance.delete(`/groups/${groupId}/leave`);
    return response.data;
  },

  async deleteGroup(groupId: string) {
    const response = await apiInstance.delete(`/groups/${groupId}`);
    return response.data;
  },

  // Message methods
  async getMessages(groupId: string, page: number = 1, limit: number = 50) {
    const response = await apiInstance.get(`/messages/${groupId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  async sendMessage(groupId: string, data: { content: string; messageType?: string }) {
    const response = await apiInstance.post(`/messages/${groupId}`, data);
    return response.data;
  },

  async editMessage(messageId: string, data: { content: string }) {
    const response = await apiInstance.put(`/messages/${messageId}`, data);
    return response.data;
  },

  async deleteMessage(messageId: string) {
    const response = await apiInstance.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await apiInstance.get('/health');
    return response.data;
  }
};

export default apiInstance;
