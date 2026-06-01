// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Función genérica para peticiones fetch
async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Funciones específicas para reportes
async function getReports(search = '', status = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    const endpoint = `/reports${params.toString() ? '?' + params.toString() : ''}`;
    const response = await apiFetch(endpoint);
    return response.data;
}

async function getReportById(id) {
    const response = await apiFetch(`/reports/${id}`);
    return response.data;
}

async function createReport(reportData) {
    const response = await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify(reportData)
    });
    return response.data;
}

async function updateReportStatus(id, status) {
    const response = await apiFetch(`/reports/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
    return response.data;
}

async function deleteReport(id) {
    const response = await apiFetch(`/reports/${id}`, {
        method: 'DELETE'
    });
    return response;
}

async function deleteAllReports() {
    const response = await apiFetch('/reports', {
        method: 'DELETE'
    });
    return response;
}

// Exportar funciones (disponibles globalmente)
window.api = {
    getReports,
    getReportById,
    createReport,
    updateReportStatus,
    deleteReport,
    deleteAllReports
};