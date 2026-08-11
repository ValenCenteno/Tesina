// Sample data structure
const sampleReports = [
    {
        id: 1,
        user: "Maria Gonzalez",
        type: "pothole",
        title: "Large pothole on main road",
        description: "Dangerous pothole causing traffic issues",
        location: "Av. Principal 123",
        status: "pending",
        image: "pothole"
    },
    {
        id: 2,
        user: "Carlos Lopez",
        type: "streetlight",
        title: "Multiple broken streetlights",
        description: "Area completely dark at night",
        location: "Plaza Central",
        status: "in-progress",
        image: "streetlight"
    },
    {
        id: 3,
        user: "Ana Martinez",
        type: "trash",
        title: "Trash overflow at park",
        description: "Bins overflowing for 3 days",
        location: "Parque Lineal",
        status: "resolved",
        image: "trash"
    },
    {
        id: 4,
        user: "Juan Perez",
        type: "graffiti",
        title: "Graffiti on school wall",
        description: "Vandalism on public school",
        location: "Escuela N°5",
        status: "pending",
        image: "graffiti"
    }
];

// DOM elements
const pages = document.querySelectorAll('.page');
const recentProblemsEl = document.getElementById('recentProblems');
const mapReportsListEl = document.getElementById('mapReportsList');
const adminTableBodyEl = document.getElementById('adminTableBody');
const reportFormEl = document.getElementById('reportForm');
const photoInputEl = document.getElementById('photo');
const photoPreviewEl = document.getElementById('photoPreview');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const mobileToggleBtn = document.getElementById('mobileToggle');
const mobileNavEl = document.getElementById('mobileNav');

// Status colors mapping
const statusColors = {
    pending: 'status-pending',
    'in-progress': 'status-progress',
    resolved: 'status-resolved'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    renderRecentProblems();
    renderMapReports();
    renderAdminTable();
    
    // Event listeners
    reportFormEl.addEventListener('submit', handleReportSubmit);
    photoInputEl.addEventListener('change', handlePhotoUpload);
    

    
    // Admin search and filter
    document.getElementById('adminSearch').addEventListener('input', handleAdminSearch);
    document.getElementById('statusFilter').addEventListener('change', handleAdminFilter);
    
    // Map search
    document.getElementById('mapSearch').addEventListener('input', handleMapSearch);
});

// Page navigation
function showPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    // Re-render data for active page
    if (pageId === 'home') renderRecentProblems();
    if (pageId === 'reports-map') renderMapReports();
    if (pageId === 'admin-dashboard') renderAdminTable();
}

// 1. Render Recent Problems (Home page)
function renderRecentProblems(filteredReports = sampleReports.slice(0, 3)) {
    recentProblemsEl.innerHTML = filteredReports.map(report => `
        <div class="problem-card" onclick="showPage('reports-map')">
            <div class="problem-image">
                <i class="fas fa-${getIcon(report.type)}"></i>
            </div>
            <div class="problem-content">
                <h3 class="problem-title">${report.title}</h3>
                <p class="problem-description">${report.description}</p>
                <div class="problem-meta">
                    <span>${report.location}</span>
                    <span class="status-tag ${statusColors[report.status]}">${report.status.replace('-', ' ').toUpperCase()}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 2. Render Map Reports
function renderMapReports(filteredReports = sampleReports) {
    mapReportsListEl.innerHTML = filteredReports.map(report => `
        <div class="map-report-item" data-report-id="${report.id}">
            <h4>${report.title}</h4>
            <p>${report.location}</p>
            <span class="status-tag ${statusColors[report.status]}">${report.status.replace('-', ' ').toUpperCase()}</span>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.map-report-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.map-report-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            // Map marker simulation
            console.log('Show report', this.dataset.reportId, 'on map');
        });
    });
}

// 3. Render Admin Table
function renderAdminTable(filteredReports = sampleReports) {
    adminTableBodyEl.innerHTML = filteredReports.map(report => `
        <tr>
            <td>#${report.id}</td>
            <td>${report.user}</td>
            <td>${report.type.replace('-', ' ').toUpperCase()}</td>
            <td>${report.location}</td>
            <td>
                <select class="status-select" data-report-id="${report.id}" onchange="updateStatus(${report.id}, this.value)">
                    <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${report.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                </select>
            </td>
            <td>
                <button class="delete-btn" onclick="deleteReport(${report.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Utility functions
function getIcon(type) {
    const icons = {
        pothole: 'road',
        streetlight: 'lightbulb',
        trash: 'trash-alt',
        graffiti: 'spray-can',
        other: 'exclamation-triangle'
    };
    return icons[type] || 'exclamation-triangle';
}

function toggleMobileNav() {
    mobileNavEl.classList.toggle('show');
}

// Form handlers
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoPreviewEl.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

function handleReportSubmit(e) {
    e.preventDefault();
    
    // Simulate form submission
    const formData = {
        type: document.getElementById('problemType').value,
        description: document.getElementById('description').value,
        location: document.getElementById('location').value,
        photo: photoInputEl.files[0]
    };
    
    // Add to sample data (in real app, send to API)
    const newReport = {
        id: sampleReports.length + 1,
        user: "Current User",
        type: formData.type,
        title: formData.description.substring(0, 50) + '...',
        description: formData.description,
        location: formData.location,
        status: 'pending',
        image: formData.type
    };
    
    sampleReports.unshift(newReport);
    
    alert('Gracias por su reporte!');
    reportFormEl.reset();
    photoPreviewEl.innerHTML = '';
    showPage('home');
}

// Admin functionality
function updateStatus(reportId, newStatus) {
    const report = sampleReports.find(r => r.id === reportId);
    if (report) {
        report.status = newStatus;
        renderAdminTable();
        alert(`Status updated to ${newStatus.replace('-', ' ')}`);
    }
}

function deleteReport(reportId) {
    if (confirm('Are you sure you want to delete this report?')) {
        const index = sampleReports.findIndex(r => r.id === reportId);
        if (index !== -1) {
            sampleReports.splice(index, 1);
            renderAdminTable();
            renderRecentProblems();
            renderMapReports();
            alert('Report deleted successfully');
        }
    }
}

function handleAdminSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = sampleReports.filter(report => 
        report.user.toLowerCase().includes(query) ||
        report.location.toLowerCase().includes(query) ||
        report.type.includes(query)
    );
    renderAdminTable(filtered);
}

function handleAdminFilter(e) {
    const status = e.target.value;
    const filtered = status 
        ? sampleReports.filter(report => report.status === status)
        : sampleReports;
    renderAdminTable(filtered);
}

function handleMapSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = sampleReports.filter(report => 
        report.title.toLowerCase().includes(query) ||
        report.location.toLowerCase().includes(query)
    );
    renderMapReports(filtered);
}

