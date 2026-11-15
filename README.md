# OS Lab

OS Lab es un laboratorio educativo para explorar algoritmos de Sistemas Operativos. El repositorio separa la interfaz web y la API en dos aplicaciones npm independientes coordinadas desde la raíz.

## Requisitos

- Node.js 20.19 o posterior y npm. El entorno se verificó con Node.js 25.2.1 y npm 11.6.2; como Node 25 está fuera de soporte, se recomienda migrar a Node.js 26 LTS para el desarrollo continuo.
- Instala todo desde la raíz con `npm install`.

## Desarrollo

```bash
npm install
npm run dev
```

Esto inicia Next.js en `http://localhost:3000` y NestJS en `http://localhost:3001`; la comprobación de salud está en `http://localhost:3001/api/health`. Los puertos no colisionan porque cada proceso escucha en uno distinto. El frontend obtiene la URL base de la API de `NEXT_PUBLIC_API_URL` (ver `frontend/.env.example`); el backend permite el origen configurado en `FRONTEND_ORIGIN` (ver `backend/.env.example`). Copia el ejemplo a `.env.local` en `frontend/` y a `.env` en `backend/` si necesitas personalizar esos valores. Los archivos de entorno locales quedan fuera de Git.

También puedes iniciar cada proceso por separado con `npm run dev:frontend` o `npm run dev:backend`.

## Comandos

- `npm run build`: compila frontend y backend.
- `npm run build:frontend` / `npm run build:backend`: compila una aplicación.
- `npm run start:frontend` / `npm run start:backend`: sirve la compilación de producción.
- `npm test` o `npm run test:backend`: ejecuta las pruebas Jest disponibles.
- `npm run lint`: ejecuta ESLint en ambos proyectos.

El backend expone una API REST bajo `/api`, activa validación global para DTOs y no requiere base de datos. Las simulaciones y pantallas funcionales se incorporarán en pasos posteriores.
