const API_URL = 'http://localhost:3000/api';

// Función para hacer peticiones autenticadas
async function fetchAuth(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    // Si hay FormData, no establecer Content-Type (se establecerá automáticamente)
    if (options.body && options.body instanceof FormData) {
        delete finalOptions.headers['Content-Type'];
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, finalOptions);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en la petición');
    }
    
    return response.json();
}

// Funciones de autenticación
async function register(username, password) {
    return fetchAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

async function login(username, password) {
    return fetchAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

async function getCurrentUser() {
    return fetchAuth('/auth/me');
}

// Funciones de reportes
async function getReports() {
    return fetchAuth('/reports');
}

async function getReport(id) {
    return fetchAuth(`/reports/${id}`);
}

async function createReport(formData) {
    return fetchAuth('/reports', {
        method: 'POST',
        body: formData
    });
}

async function updateReport(id, formData) {
    return fetchAuth(`/reports/${id}`, {
        method: 'PUT',
        body: formData
    });
}

async function updateReportStatus(id, status) {
    return fetchAuth(`/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
}

async function deleteReport(id) {
    return fetchAuth(`/reports/${id}`, {
        method: 'DELETE'
    });
}

async function getUserReports(userId) {
    return fetchAuth(`/reports/user/${userId}`);
}