const API_URL = 'http://localhost:3000/api';

async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Si hay FormData, dejar que el browser setee el Content-Type (con boundary)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Error en la petición');
    }

    return data;
}

// Namespace global accesible desde cualquier página
window.api = {
    // Auth
    register: (username, password) =>
        fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

    login: (username, password) =>
        fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

    getMe: () => fetchAPI('/auth/me'),

    // Reportes
  getReports: async (search = '', status = '') => {
    const params = new URLSearchParams();

    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const query = params.toString() ? `?${params}` : '';

    const response = await fetchAPI(`/reports${query}`);

    return response.data || [];
},

    getReport: (id) => fetchAPI(`/reports/${id}`),

    createReport: (formData) =>
        fetchAPI('/reports', { method: 'POST', body: formData }),

    updateReport: (id, formData) =>
        fetchAPI(`/reports/${id}`, { method: 'PUT', body: formData }),

    updateReportStatus: (id, status) =>
        fetchAPI(`/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

    deleteReport: (id) =>
        fetchAPI(`/reports/${id}`, { method: 'DELETE' }),

    getUserReports: (userId) => fetchAPI(`/reports/user/${userId}`)
};