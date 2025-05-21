import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    
    // Save token to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Election services
const electionService = {
  getElectionDetails: async (electionId: string) => {
    const response = await api.get(`/elections/${electionId}`);
    return response.data;
  },
  
  submitVote: async (electionId: string, candidateId: string) => {
    const response = await api.post(`/elections/${electionId}/vote`, {
      candidateId
    });
    return response.data;
  },
  
  getElections: async () => {
    const response = await api.get('/elections');
    return response.data;
  },
  
  getElectionResults: async (electionId: string) => {
    const response = await api.get(`/elections/${electionId}/results`);
    return response.data;
  },

  checkVoteStatus: async (electionId: string) => {
    try {
      const response = await api.get(`/elections/${electionId}/vote-status`);
      return response.data;
    } catch (error) {
      console.error('Error checking vote status:', error);
      throw error;
    }
  },

  // Admin endpoints
  createElection: async (electionData: any) => {
    const response = await api.post('/elections', electionData);
    return response.data;
  },

  updateElection: async (electionId: string, electionData: any) => {
    const response = await api.put(`/elections/${electionId}`, electionData);
    return response.data;
  },

  deleteElection: async (electionId: string) => {
    const response = await api.delete(`/elections/${electionId}`);
    return response.data;
  },

  getElectionStats: async (electionId: string) => {
    const response = await api.get(`/elections/${electionId}/stats`);
    return response.data;
  }
};

export { electionService };
export default api;
