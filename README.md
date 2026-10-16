# CiudadActiva

## Descripción

**CiudadActiva** es una plataforma web para que los ciudadanos de Río Tercero puedan informar problemas urbanos de la ciudad.

El sistema permite crear reportes sobre diferentes problemas, como calles rotas, basura, luminarias, caños rotos, cordones y otros inconvenientes. Los reportes pueden incluir una descripción, una fotografía y una ubicación para facilitar su visualización y gestión.

---

## Integrantes

- **Valentino Centeno**
- **Uriel Ponce**

---

## Tecnologías utilizadas

- **HTML** — Estructura de las páginas.
- **CSS** — Diseño y estilos.
- **JavaScript** — Funcionalidad e interacción.
- **Node.js** — Backend.
- **Express** — Servidor y API.
- **MySQL** — Base de datos.
- **phpMyAdmin** — Administración de la base de datos.
- **XAMPP** — Entorno de desarrollo.
- **Leaflet** — Mapa interactivo.

---

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Creación de reportes de problemas urbanos.
- Selección de ubicación para los reportes.
- Carga de fotografías.
- Visualización de los reportes en un mapa.
- Consulta de problemas recientes.
- Panel de administración.
- Gestión del estado de los reportes.
- Modo claro y modo oscuro.

---

## Organización del proyecto

El proyecto está dividido principalmente en:
- `frontend/`: contiene las páginas HTML, estilos CSS y archivos JavaScript de la interfaz.
- `backend/`: contiene el servidor, las rutas, la configuración y la conexión con la base de datos.
- `database/`: contiene los archivos relacionados con la base de datos, si corresponde.

---

## Cómo ejecutar el proyecto

1. Descargar o clonar el repositorio.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Encender XAMPP.
4. Iniciar MySQL desde XAMPP.
5. Verificar que la base de datos del proyecto esté creada.
6. Abrir una terminal en la carpeta del backend.
7. Instalar las dependencias necesarias si todavía no están instaladas.
8. Ejecutar el servidor backend.
9. Abrir la aplicación desde el navegador utilizando la dirección correspondiente al servidor.

---

## Base de datos

CiudadActiva utiliza **MySQL** para almacenar la información de los usuarios y los reportes.
**phpMyAdmin** se utiliza para administrar la base de datos.
La conexión con la base de datos se realiza desde el backend mediante **Node.js y Express**.

---

## Estado del proyecto

El proyecto se encuentra en **desarrollo**.
Las funciones principales de registro, inicio de sesión, creación de reportes, ubicación de reportes en el mapa y administración de reportes se encuentran implementadas.
Actualmente se continúa trabajando en mejoras de la interfaz, experiencia de usuario, estados de la aplicación y otras funcionalidades de la plataforma.

---

## Cómo ejecutar el proyecto

### Requisitos previos

Para ejecutar CiudadActiva, es necesario contar con las siguientes herramientas:

- **Node.js:** para ejecutar el backend.
- **XAMPP:** para iniciar el servicio MySQL.
- **MySQL:** para almacenar la información del sistema.
- **phpMyAdmin:** para administrar la base de datos.
- **Visual Studio Code:** para abrir y editar el código.
- **Un navegador web:** para acceder a la plataforma.

### Instalación y configuración

1. **Descargar el proyecto:** clonar el repositorio desde GitHub o descargarlo como archivo ZIP.

2. **Abrir el proyecto:** abrir la carpeta de CiudadActiva en Visual Studio Code.

3. **Iniciar MySQL:** abrir XAMPP e iniciar el servicio MySQL.

4. **Configurar la base de datos:** ingresar a phpMyAdmin y verificar que la base de datos esté creada e importada correctamente.

5. **Instalar las dependencias:** abrir una terminal en la carpeta `backend/` y ejecutar:

   ```bash
   npm install
   ```

6. **Configurar la conexión:** comprobar que el backend tenga los parámetros necesarios para conectarse a MySQL. No publicar contraseñas ni credenciales privadas.

### Inicio del sistema

1. **Iniciar el backend:** desde la terminal, ejecutar el comando configurado en el proyecto para iniciar el servidor.

2. **Abrir el frontend:** acceder a la aplicación desde el navegador utilizando la dirección correspondiente a su configuración.

3. **Verificar el funcionamiento:** comprobar que el sistema cargue correctamente y que las principales funcionalidades estén disponibles.

### Consideraciones

- La base de datos MySQL debe estar activa para que el sistema pueda acceder a la información.
- Las dependencias deben estar instaladas antes de iniciar el backend.
- Los comandos exactos para iniciar el servidor y la dirección del frontend deben verificarse en los archivos de configuración del proyecto.
- Si el proyecto incluye un archivo SQL, debe utilizarse para preparar la base de datos antes de ejecutar el sistema.
- No se deben subir credenciales privadas ni archivos `.env` que contengan información sensible.

---
