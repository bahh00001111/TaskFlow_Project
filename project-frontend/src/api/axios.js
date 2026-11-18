import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// បន្ថែម Request Interceptor ដើម្បីភ្ជាប់ Token ដោយស្វ័យប្រវត្តិទៅជាមួយ Request នីមួយៗ (ប្រសិនបើមាន Token)
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// បន្ថែម Response Interceptor ដើម្បីពិនិត្យ Error ផ្សេងៗ (ឧទាហរណ៍ 401 Unauthorized)
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const { response } = error;
        if (response && response.status === 401) {
            localStorage.removeItem('ACCESS_TOKEN');
        }
        throw error;
    }
);

export default axiosClient;