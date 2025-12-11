# iWARDROBE v3.0 🪞✨

**Smart Mirror Platform** - Your AI-Powered Virtual Wardrobe Assistant

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-2D9CDB?style=flat-square&logo=google&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)

---

## 🎯 Descripción

iWARDROBE es una plataforma inteligente de espejo virtual que revoluciona cómo seleccionas tu atuendo diario. Combina:

- 🤖 **Inteligencia Artificial** - Recomendaciones personalizadas
- 📷 **Visión por Computadora** - Detección de pose en tiempo real
- 🗣️ **Interfaz de Voz** - Asistente ARIA con conversación natural
- 🎨 **Realidad Aumentada** - Prueba virtual de ropa
- 📊 **Analytics** - Análisis inteligente de tu guardarropa

---

## ✨ Características Principales

### 🤖 ARIA - AI Voice Assistant
- **Conversación Continua**: Detección automática de voz con soporte para comandos naturales
- **Recomendaciones Inteligentes**: Sugerencias de outfits basadas en clima, eventos y preferencias
- **Diálogos Naturales**: Powered by advanced AI para conversaciones fluidas

### 👕 Prueba Virtual (Virtual Try-On)
- **Detección de Pose**: Body tracking en tiempo real con MediaPipe
- **Controles por Gesto**: Interacción hands-free intuitiva
- **Overlay de AR**: Visualiza cómo se ven las prendas en ti

### 🌤️ Widgets Inteligentes
- **Integración de Clima**: Datos meteorológicos en tiempo real
- **Analytics de Guardarropa**: Estadísticas de uso de prendas
- **Calendario de Eventos**: Sugerencias de atuendos por evento

### 📏 Análisis Biométrico
- **Medidas Automáticas**: Tracking de medidas corporales
- **Recomendaciones de Talla**: Sugerencias personalizadas de ajuste
- **Historial de Cambios**: Monitorea tu evolución

---

## 🏗️ Arquitectura

```
iwardrobe/
├── apps/
│   ├── api/          # Backend FastAPI
│   │   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── web/          # Frontend Next.js
│       ├── app/
│       ├── components/
│       └── lib/
└── packages/         # Librerías compartidas
```

### 🔙 Backend (FastAPI)
- **Autenticación**: JWT tokens seguros
- **API Biometrics**: Tracking de medidas corporales
- **Engine de Recomendaciones**: IA para sugerencias de outfits
- **Base de Datos**: PostgreSQL + SQLAlchemy ORM
- **API Documentation**: Swagger/OpenAPI automático

### 🎨 Frontend (Next.js)
- **React 18+**: TypeScript para type safety
- **Tailwind CSS**: Diseño responsive
- **MediaPipe**: Detección de pose y manos
- **Web Speech API**: Integración de voz
- **Canvas API**: Renderizado en tiempo real

---

## 🚀 Instalación Rápida

### Requisitos Previos
- Node.js 18+
- Python 3.9+
- PostgreSQL 12+
- npm o yarn

### Backend (FastAPI)

```bash
cd apps/api

# Crear virtual environment
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos
cp .env.example .env
# Edita .env con tus credenciales

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
python -m uvicorn app.main:app --reload
```

**API Docs disponible en**: http://localhost:8000/docs

### Frontend (Next.js)

```bash
cd apps/web

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev
```

**Aplicación disponible en**: http://localhost:3000

---

## ⚙️ Configuración

### Variables de Entorno (Backend)

Crear `apps/api/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost/iwardrobe
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI (opcional para IA mejorada)
OPENAI_API_KEY=sk-...

# AWS (opcional para storage de imágenes)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
```

### Variables de Entorno (Frontend)

Crear `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=iWARDROBE
```

---

## 📖 Guía de Uso

### 1️⃣ Crear Cuenta
- Registrate o inicia sesión
- Completa tu perfil con preferencias

### 2️⃣ Configurar Medidas
- Activa la cámara para medidas automáticas
- O ingresa manualmente tus medidas

### 3️⃣ Añadir Guardarropa
- Fotografía tu ropa
- Categoriza por tipo, color, temporada
- Asigna tallas personalizadas

### 4️⃣ Activar ARIA
- Di "Hey ARIA" para activar el asistente
- Pide recomendaciones de outfits
- Prueba ropa con AR overlay

### 5️⃣ Analizar Datos
- Revisa estadísticas de uso
- Descubre tus prendas favoritas
- Optimiza tu guardarropa

---

## 🛠️ Comandos Disponibles

### Backend
```bash
cd apps/api

# Desarrollo
python -m uvicorn app.main:app --reload

# Tests
pytest test_auth.py
pytest test_biometrics.py
pytest test_recommendations.py

# Migraciones
alembic current
alembic upgrade head
alembic revision --autogenerate -m "description"
```

### Frontend
```bash
cd apps/web

# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm test

# Linting
npm run lint
```

---

## 🧪 Testing

### Backend Tests
```bash
cd apps/api
pytest                    # Ejecutar todos
pytest -v                # Verbose
pytest -k "test_auth"   # Tests específicos
```

### Frontend Tests
```bash
cd apps/web
npm test                 # Jest
npm run test:e2e        # E2E con Playwright
```

---

## 📚 Tech Stack Completo

### Frontend
- **Next.js 15** - React framework con SSR/SSG
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS
- **MediaPipe** - Pose & hand detection
- **Web Speech API** - Voice interaction
- **Canvas API** - Real-time rendering

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM para Python
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación segura
- **Pydantic** - Data validation
- **Alembic** - Database migrations

### AI/ML
- **MediaPipe** - Computer vision
- **Custom ML Models** - Recommendation engine
- **OpenAI API** - Enhanced AI (optional)

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación local
- **GitHub Actions** - CI/CD

---

## 📊 Estructura de Carpetas

```
apps/web/
├── app/                # Next.js App Router
│   ├── auth/          # Autenticación
│   ├── dashboard/     # Panel principal
│   └── wardrobe/      # Gestor de prendas
├── components/        # React components
│   ├── ARIA/         # Voice assistant
│   ├── VirtualTryOn/ # AR try-on
│   └── Widgets/      # Widgets inteligentes
├── lib/               # Utilidades
└── hooks/             # Custom React hooks

apps/api/
├── app/
│   ├── main.py       # Entrada principal
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── routes/       # API endpoints
│   └── services/     # Lógica de negocio
├── tests/
├── migrations/       # Alembic migrations
└── requirements.txt
```

---

## 🔐 Seguridad

- ✅ JWT Authentication con refresh tokens
- ✅ Password hashing con bcrypt
- ✅ CORS configurado
- ✅ Rate limiting en API
- ✅ Input validation con Pydantic
- ✅ HTTPS recomendado en producción

---

## 📈 Optimizaciones Implementadas

- 🚀 Image optimization y lazy loading
- 💨 Code splitting automático
- 🎯 Tree shaking
- 📦 Bundle size optimizado
- ♿ Accesibilidad WCAG 2.1 AA
- 📱 Mobile-first responsive design

---

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea rama: `git checkout -b feature/feature-name`
3. Commit: `git commit -m 'Add feature'`
4. Push: `git push origin feature/feature-name`
5. Pull Request

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles.

---

## 👨‍💻 Autor

**Juan Novoa** - [@jenovoas](https://github.com/jenovoas)

Sígueme en:
- 🐙 [GitHub](https://github.com/jenovoas)
- 💼 [LinkedIn](https://linkedin.com/in/jenovoas)
- 🐦 [Twitter](https://twitter.com/jenovoas)

---

## 🙏 Agradecimientos

- MediaPipe por herramientas de CV
- Next.js y FastAPI por excelentes frameworks
- La comunidad open source

<div align="center">

⭐ **Si te gusta este proyecto, dame una estrella en GitHub** ⭐

</div>
