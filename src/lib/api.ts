import axios from 'axios';

// Automatically use relative path on Vercel environment or localhost based on window location
const api = axios.create({
    baseURL: '/api', // This works universally if the backend is on the same domain (Vercel)
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
