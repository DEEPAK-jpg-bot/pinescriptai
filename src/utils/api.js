import axios from 'axios';
import { supabase } from './supabaseClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the Supabase JWT token
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add a response interceptor to handle errors and mock data for demo purposes
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // If the backend is unreachable (Network Error), simulate a successful response for demo
        if (!error.response) {
            console.warn('Backend unreachable. Serving mock data for demo.');
            
            const url = error.config.url;
            
            // Mock Generate Endpoint
            if (url.includes('/generate')) {
                return {
                    data: {
                        message: {
                            content: `//@version=6
// Mock Generated Code (Demo Mode)
// The backend is currently offline, but here is a sample script.

indicator("Demo Strategy", overlay=true)

// Input parameters
len = input.int(14, "Length")
src = input.source(close, "Source")

// Calculate RSI
rsiValue = ta.rsi(src, len)

// Plot
plot(rsiValue, "RSI", color=color.blue)
hline(70, "Overbought", color=color.red)
hline(30, "Oversold", color=color.green)

// Logic
buySignal = ta.crossover(rsiValue, 30)
sellSignal = ta.crossunder(rsiValue, 70)

plotshape(buySignal, "Buy", shape.triangleup, location.belowbar, color.green, size=size.small)
plotshape(sellSignal, "Sell", shape.triangledown, location.abovebar, color.red, size=size.small)
` 
                        },
                        thread_id: 'demo-thread-123'
                    }
                };
            }

            // Mock Threads Endpoint
            if (url.includes('/threads')) {
                return {
                    data: [
                        { id: '1', title: 'RSI Divergence Strategy' },
                        { id: '2', title: 'Bollinger Band Squeeze' },
                        { id: '3', title: 'MACD Trend Follower' }
                    ]
                };
            }
            
            // Mock Profile Endpoint
            if (url.includes('/user/profile')) {
                return {
                    data: {
                        name: 'Demo User',
                        plan: 'Pro',
                        tokens_remaining: 850,
                        tokens_monthly_limit: 1000
                    }
                };
            }
        }
        return Promise.reject(error);
    }
);

export default api;
