# 🌮 Sistema de Gestión de Taquería

Sistema gráfico e intuitivo para tablets que permite a meseros y administradores gestionar el flujo de trabajo en una taquería: desde el control de mesas y órdenes, hasta el inventario y reportes de ventas.

## 🧠 Objetivo General

Desarrollar un sistema gráfico y responsivo para la gestión operativa y administrativa de una taquería, facilitando el trabajo de meseros y administradores a través de una interfaz moderna, ágil y eficiente.

## 🎯 Objetivos Específicos

- Controlar el estado de las mesas en tiempo real.
- Registrar y modificar órdenes por mesa.
- Calcular totales de consumo y dividir cuentas.
- Administrar inventario de productos y platillos.
- Asignar mesas y meseros dinámicamente.
- Generar reportes de ventas y productos más vendidos.

---

## 🧱 Stack Tecnológico

| Componente | Tecnología |
|-----------|------------|
| **Frontend** | React + TypeScript + Vite + Tailwind CSS |
| **Backend**  | Node.js + Express |
| **Base de Datos** | SQLite (LiteSQL) |
| **Lenguaje** | TypeScript / JavaScript |
| **Control de versiones** | Git + GitHub |
| **Diseño UI/UX** | Figma |
| **Hosting** | Localhost (modo desarrollo) |

---

## 📂 Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
backend/
  config/         # Configuración del servidor y base de datos
  seeds/          # Scripts para inicializar datos
  src/            # Código fuente del backend
    api/v1/       # Endpoints de la API
    controllers/  # Controladores de lógica de negocio
    models/       # Modelos de datos
    utils/        # Utilidades compartidas
frontend/
  src/            # Código fuente del frontend
    components/   # Componentes reutilizables
    pages/        # Páginas principales
    services/     # Servicios para consumir la API
    utils/        # Utilidades compartidas
```

---

## 📋 Tabla de Requerimientos

| Categoría         | Requerimiento                                                  |
|-------------------|----------------------------------------------------------------|
| Mesas             | Visualizar estado, asignar mesero, liberar                     |
| Órdenes           | Crear, modificar, eliminar, cerrar                             |
| Productos         | Ver catálogo, precios, disponibilidad                          |
| Inventario        | Control de existencias, modificación por orden                 |
| Reportes          | Ventas diarias, productos más vendidos                         |
| Autenticación     | Login por usuario y tipo (mesero/admin)                        |
| UX/UI             | Responsivo, rápido, intuitivo                                  |
| Base de datos     | Persistencia de mesas, órdenes, productos, usuarios            |

---

## 🖥️ Módulos Frontend por Implementar

- [x] Login y Logout
- [x] Dashboard de mesas
- [x] Creación y edición de órdenes
- [ ] Control de inventario y productos
- [ ] Vista de reportes
- [ ] Gestión de usuarios y roles

---

## 📡 API REST (Backend)

Ejemplos de endpoints que se incluirán:

```http
GET    /mesas            → Obtener estado de todas las mesas
POST   /ordenes          → Crear nueva orden
PUT    /ordenes/:id      → Modificar orden existente
GET    /productos        → Listar catálogo de productos
PUT    /inventario/:id   → Actualizar existencia
GET    /reportes/ventas  → Consultar ventas del día
```

---

## 🧪 Ejecución en Local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

---

## 🚀 Instalación

Sigue estos pasos para configurar el proyecto en tu máquina local:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/usuario/taqueria-app.git
   cd taqueria-app
   ```

2. Instala las dependencias del backend:
   ```bash
   cd backend
   npm install
   ```

3. Instala las dependencias del frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configura la base de datos:
   - Asegúrate de que SQLite esté instalado.
   - Ejecuta las migraciones necesarias desde la carpeta `database/migrations/`.

---

## 🖥️ Uso

### Desarrollo

1. Inicia el backend:
   ```bash
- El diseño y flujo de trabajo han sido pensados para ser simples, prácticos y realistas.
