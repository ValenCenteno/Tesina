// Datos de ejemplo (simulando una base de datos)
let reports = [
    { id: 1, user: "Maria Gonzalez", type: "pothole", title: "Large pothole on main road", description: "Dangerous pothole causing traffic issues", location: "Av. Principal 123", status: "pending", image: "pothole" },
    { id: 2, user: "Carlos Lopez", type: "streetlight", title: "Multiple broken streetlights", description: "Area completely dark at night", location: "Plaza Central", status: "in-progress", image: "streetlight" },
    { id: 3, user: "Ana Martinez", type: "trash", title: "Trash overflow at park", description: "Bins overflowing for 3 days", location: "Parque Lineal", status: "resolved", image: "trash" },
    { id: 4, user: "Juan Perez", type: "graffiti", title: "Graffiti on school wall", description: "Vandalism on public school", location: "Escuela N°5", status: "pending", image: "graffiti" }
];

// Función para obtener todos los reportes
function getReports() { return reports; }

// Función para agregar un reporte
function addReport(report) {
    const newId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
    const newReport = { id: newId, ...report, status: 'pending' };
    reports.unshift(newReport);
    return newReport;
}

// Función para actualizar estado
function updateReportStatus(id, newStatus) {
    const report = reports.find(r => r.id == id);
    if (report) report.status = newStatus;
}

// Función para eliminar reporte
function deleteReportById(id) {
    const index = reports.findIndex(r => r.id == id);
    if (index !== -1) reports.splice(index, 1);
}

// Helper para ícono según tipo
function getIcon(type) {
    const icons = { pothole: 'road', streetlight: 'lightbulb', trash: 'trash-alt', graffiti: 'spray-can' };
    return icons[type] || 'exclamation-triangle';
}