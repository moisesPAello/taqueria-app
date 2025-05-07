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

## 📁 Estructura del Proyecto

```
taqueria-app/
├── frontend/           # Interfaz de usuario (React + TypeScript + Vite)
│   └── src/
│       ├── components/    # Elementos reutilizables
│       │   ├── common/    # Componentes base
│       │   ├── features/  # Componentes específicos por feature
│       │   └── layout/    # Componentes de estructura
│       ├── context/      # Contextos de React (Auth, etc.)
│       ├── hooks/        # Custom hooks
│       ├── pages/        # Vistas principales
│       ├── services/     # Comunicación con API
│       ├── types/        # Definiciones de TypeScript
│       └── utils/        # Utilidades y helpers
│
├── backend/            # Lógica del servidor (Node.js + Express)
│   └── src/
│       ├── api/         # Endpoints por versión
│       ├── controllers/ # Lógica de negocio
│       ├── models/      # Definición de modelos
│       ├── services/    # Servicios de negocio
│       ├── middleware/  # Autenticación, validaciones
│       └── validators/  # Validación de datos
│
├── database/           # Base de datos SQLite
│   ├── migrations/     # Scripts para crear/modificar tablas
│   ├── seeds/         # Datos de prueba
│   └── backups/       # Respaldos automáticos
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

## 🗄️ Sistema de Respaldos

El sistema incluye un mecanismo automático de respaldos de la base de datos:
- Ubicación: `/database/backups/`
- Formato: `database_backup_YYYYMMDD.db`
- Frecuencia: Diaria
- Retención: 30 días

## 🔄 Migraciones Recientes

- `20250505_add_num_personas`: Añade soporte para número de personas por mesa
- Más detalles en `/database/migrations/`

---

## 🧑‍💻 Autor

Moisés Pérez Aello  
Itzel Alejandra Monroy Alvarez
Proyecto académico para la materia de Sistemas de Información

---

## 🧠 Notas Finales

- Este sistema está pensado para ejecutarse localmente (modo desarrollo).
- El enfoque es educativo, pero la arquitectura está lista para escalar.
- El diseño y flujo de trabajo han sido pensados para ser simples, prácticos y realistas.
