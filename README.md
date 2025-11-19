# API REST - Gestión de Archivos y JWT

API REST con Node.js y Express para gestión de archivos y autenticación con JWT.

## Instalación rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
cp .env.example .env

# 3. Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Crear carpeta uploads
mkdir uploads

# 5. Iniciar servidor
npm run dev
```

Servidor en: `http://localhost:3000`

## Endpoints principales

### Usuarios
- `POST /api/users/register` - Registrar usuario
- `POST /api/users/login` - Login y obtener token
- `GET /api/users/profile` - Obtener perfil (requiere token)
- `GET /api/users` - Listar usuarios

### Archivos (requieren token en header: `Authorization: Bearer <token>`)
- `POST /api/files/upload` - Subir archivo
- `GET /api/files` - Listar mis archivos
- `GET /api/files/:fileId` - Detalles del archivo
- `GET /api/files/download/:fileId` - Descargar archivo
- `DELETE /api/files/:fileId` - Eliminar archivo

## Pruebas rápidas

### 1. Registrar
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@example.com","password":"123456"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"123456"}'
```

### 3. Subir archivo
```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/ruta/al/archivo.pdf"
```

## Estructura

```
M8_EV_MOD/
├── src/
│   ├── controllers/
│   │   ├── userController.js
│   │   └── fileController.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── fileRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── config/
│   │   └── database.js
│   └── app.js
├── uploads/
├── .env
├── .env.example
├── package.json
└── README.md
```

## Variables de entorno (.env)

```
PORT=
NODE_ENV=

JWT_SECRET=
JWT_EXPIRE=

DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

UPLOAD_DIR=
MAX_FILE_SIZE=
```

## Características

Autenticación JWT
Carga/descarga de archivos
Validación de tipos de archivo
Límite de tamaño 50MB
Control de acceso por usuario
Encriptación de contraseñas

## Dependencias

- express
- express-fileupload
- jsonwebtoken
- bcryptjs
- dotenv
- cors

## Scripts

```bash
npm run dev    # Modo desarrollo
npm start      # Modo producción
```

Evaluación Módulo 8 - Bootcamp JavaScript