# Taquería App

Sistema de gestión para cadena de taquerías con interfaz de meseros y panel administrativo.

## 🎯 Objetivo

Desarrollar una aplicación web local para optimizar el funcionamiento de una cadena de taquerías, enfocándose en dos áreas principales:
1. **Interfaz de meseros (Tablets):** Toma de pedidos, control de mesas y cuentas.
2. **Panel administrativo:** Control de inventario, precios, platillos, bebidas, asignación de meseros y reportes.

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - React.js
  - Tailwind CSS
  - React Router
- **Base de Datos:**
  - SQLite
- **Herramientas de Desarrollo:**
  - Node.js
  - npm
  - Git

## 📁 Estructura del Proyecto

```
/taqueria-app
├── /frontend
│   ├── /components (Componentes reutilizables)
│   ├── /pages (Vistas principales)
│   ├── /styles (Estilos y configuraciones CSS)
│   └── App.jsx (Punto de entrada)
├── /data
│   └── database.db (Base de datos SQLite)
├── /design
│   └── figma-files/ (Diseños y mockups)
├── README.md
└── package.json
```

## 🚀 Requisitos

- Node.js (v14 o superior)
- npm o yarn
- SQLite

## 💻 Instalación

1. Clonar el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd taqueria-app
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar la aplicación:
   ```bash
   npm start
   ```

## 📝 Guía de Desarrollo

1. **Configuración del Entorno**
   - Instalar Node.js
   - Clonar el repositorio
   - Instalar dependencias

2. **Estructura de Código**
   - Componentes en `/frontend/components`
   - Páginas en `/frontend/pages`
   - Estilos en `/frontend/styles`

3. **Base de Datos**
   - Archivo SQLite en `/data/database.db`
   - Esquema definido en `/data/database.js`

## 🤝 Contribución

1. Hacer fork del proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
