# Miga-Co — Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.x-0055FF?style=flat-square&logo=framer&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

**Interfaz web de Miga-Co**, una plataforma de pastelería artesanal en línea.  
Construida con React 19 + Vite, ofrece un diseño premium con paleta morada y animaciones fluidas.

</div>

---

## 📋 Tabla de contenidos

- [Descripción del proyecto](#-descripción-del-proyecto)
- [Stack tecnológico](#-stack-tecnológico)
- [Sistema de diseño](#-sistema-de-diseño)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Páginas y rutas](#-páginas-y-rutas)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts disponibles](#-scripts-disponibles)

---

## 🎂 Descripción del proyecto

**Miga-Co** es una tienda de pastelería artesanal que permite a los clientes explorar el catálogo de productos, agregar artículos al carrito, realizar pedidos y dejar reseñas. Los administradores cuentan con paneles dedicados para gestionar productos y pedidos.

### Características principales

- 🛍️ **Catálogo interactivo** con filtros por categoría y búsqueda en tiempo real
- 🛒 **Carrito de compras** persistente con gestión de cantidades
- 📦 **Historial de pedidos** con estados de seguimiento
- 🔐 **Autenticación completa**: registro, login, 2FA por correo, recuperación de contraseña
- 👤 **Perfil de usuario** con edición de datos y configuración de seguridad
- ⭐ **Sistema de reseñas** con calificación por estrellas
- 🎨 **Panel de administración** para productos y pedidos (rol admin)
- 📱 **Diseño responsive** adaptado a móvil y escritorio

---

## 🛠 Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| **React** | 19 | Librería de UI con componentes funcionales y hooks |
| **Vite** | 7.x | Bundler y servidor de desarrollo ultrarrápido |
| **React Router DOM** | 6.x | Enrutamiento del lado del cliente (SPA) |
| **Framer Motion** | 12.x | Animaciones declarativas y transiciones fluidas |
| **Axios** | 1.x | Cliente HTTP para consumir la API REST del backend |
| **CSS Vanilla** | — | Estilos propios, sin frameworks externos |

---

## 🎨 Sistema de diseño

El proyecto usa un sistema de diseño propio definido en `src/index.css` y `src/App.css`.

### Paleta de colores

| Variable CSS | Valor | Uso |
|---|---|---|
| `--primary` | `#2D006B` | Morado oscuro — textos, fondos principales, botones |
| `--secondary` | `#560BAD` | Violeta medio — acentos secundarios, hover states |
| `--accent` | `#7B2CBF` | Violeta claro — bordes, íconos, detalles |
| `--neutral-light` | `#E9D8FD` | Lavanda suave — fondos de chips, badges |
| `--neutral-bg` | `#FFFFFF` | Blanco puro — fondo general de la app |

### Tipografías

- **`Outfit`** (Google Fonts) — Headings, logos, títulos (pesos 300–800)
- **`Inter`** (Google Fonts) — Cuerpo, botones, inputs, párrafos (pesos 300–700)

---

## 📁 Estructura del proyecto

```
Miga-Co_FrontEnd/
├── public/                       # Archivos estáticos servidos directamente
├── src/
│   ├── Api/                      # Módulos de acceso a la API REST del backend
│   ├── assets/                   # Imágenes, íconos y recursos estáticos
│   ├── components/
│   │   ├── catalog/              # Componentes del catálogo (tarjetas, filtros)
│   │   ├── common/               # Componentes reutilizables (Navbar, Footer, Breadcrumb)
│   │   └── reviews/              # Componentes de reseñas y calificaciones
│   ├── context/
│   │   ├── AuthContext.jsx       # Contexto global de autenticación y sesión
│   │   └── CarritoContext.jsx    # Contexto global del carrito de compras
│   ├── hooks/                    # Custom hooks reutilizables
│   ├── pages/                    # Páginas de la aplicación (una por ruta)
│   │   ├── Home.jsx              # Página de inicio con hero section
│   │   ├── Login.jsx             # Autenticación (login, registro, 2FA, recuperar)
│   │   ├── CatalogoPage.jsx      # Catálogo de productos
│   │   ├── ProductDetail.jsx     # Detalle de un producto
│   │   ├── Carrito.jsx           # Carrito de compras y proceso de compra
│   │   ├── Perfil.jsx            # Perfil de usuario y configuración de seguridad
│   │   ├── AdminProductos.jsx    # Panel admin — gestión de productos
│   │   ├── AdminPedidos.jsx      # Panel admin — gestión de pedidos
│   │   ├── AvisoPrivacidad.jsx   # Aviso de privacidad
│   │   ├── Sitemap.jsx           # Mapa del sitio
│   │   ├── NotFound.jsx          # Error 404
│   │   └── Error500.jsx          # Error 500
│   ├── utils/                    # Funciones auxiliares y helpers
│   ├── App.jsx                   # Componente raíz — rutas y layout global
│   ├── App.css                   # Estilos globales y sistema de diseño
│   ├── index.css                 # Variables CSS, reset y fuentes
│   └── main.jsx                  # Punto de entrada de React (ReactDOM.render)
├── index.html                    # Plantilla HTML principal
├── vite.config.js                # Configuración de Vite
├── eslint.config.js              # Configuración de ESLint
├── .env                          # Variables de entorno (no se sube al repo)
├── .gitignore
└── package.json
```

---

## 🗺 Páginas y rutas

| Ruta | Componente | Acceso | Descripción |
|---|---|---|---|
| `/` | `Home` | Público | Landing page con hero y destacados |
| `/login` | `Login` | Público | Autenticación, registro y recuperación |
| `/productos` | `CatalogoPage` | Público | Catálogo con filtros y búsqueda |
| `/producto/:id` | `ProductDetail` | Público | Detalle y reseñas de un producto |
| `/carrito` | `Carrito` | 🔒 Usuario | Carrito y proceso de compra |
| `/perfil` | `Perfil` | 🔒 Usuario | Datos personales, pedidos y seguridad |
| `/admin/productos` | `AdminProductos` | 🔒 Admin | CRUD de productos |
| `/admin/pedidos` | `AdminPedidos` | 🔒 Admin | Gestión y seguimiento de pedidos |
| `/privacidad` | `AvisoPrivacidad` | Público | Aviso de privacidad |
| `/sitemap` | `Sitemap` | Público | Mapa del sitio |
| `/500` | `Error500` | Público | Error interno de servidor |
| `*` | `NotFound` | Público | Error 404 |

---

## ✅ Requisitos previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- El **backend de Miga-Co** corriendo en local o en la URL configurada en `.env`

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd Miga-Co_FrontEnd

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# 4. Arrancar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL base de la API REST del backend
VITE_API_URL=http://localhost:3000/api
```

> ⚠️ En Vite, todas las variables de entorno expuestas al cliente **deben** comenzar con el prefijo `VITE_`.

---

## 📜 Scripts disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo con HMR
npm run build     # Genera el bundle de producción en /dist
npm run preview   # Previsualiza el build de producción localmente
npm run lint      # Ejecuta ESLint para detectar errores de código
```

---

<div align="center">
  <sub>© 2025 Miga-Co · Pastelería artesanal · Hecho con ☕ y mucho azúcar</sub>
</div>
