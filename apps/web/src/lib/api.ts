import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn("localStorage not available for token:", error);
        }
        
        // Don't override Content-Type if data is URLSearchParams (for OAuth2 form data)
        if (config.data instanceof URLSearchParams) {
            // Remove Content-Type header to let axios set it automatically to application/x-www-form-urlencoded
            delete config.headers["Content-Type"];
        }
        
        // Set timeout for requests (30 seconds)
        config.timeout = config.timeout || 30000;
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for error handling and retry logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Retry logic for network errors (max 2 retries)
        if (!originalRequest._retry && error.code === "ECONNABORTED" || !error.response) {
            originalRequest._retry = true;
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            
            if (originalRequest._retryCount <= 2) {
                // Exponential backoff: wait 1s, 2s
                const delay = originalRequest._retryCount * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return api(originalRequest);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
