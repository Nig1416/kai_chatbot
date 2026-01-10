import axios from 'axios';

// Automatically choose URL based on environment
// In Production (Vercel), we will set VITE_API_BASE_URL to the Render Backend URL.
// In Development (Local), it defaults to http://localhost:5000.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
