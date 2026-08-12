## Finanzas personales

App de finanzas personales: registra gastos e ingresos con categoría y tags, visualiza gráficos de gasto/ahorro filtrables y define presupuestos por categoría. Cada usuario inicia sesión con su cuenta de Google y ve solo sus propios datos.

Stack: Next.js 15 (App Router) + Auth.js (Google) + MongoDB Atlas (Mongoose) + Recharts + Tailwind CSS v4.

### Configurar Google OAuth

1. Ve a [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Crea un proyecto (si no tienes uno) y una credencial de tipo **OAuth client ID** → **Web application**.
3. En **Authorized redirect URIs** añade:
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://<tu-dominio-de-vercel>/api/auth/callback/google` (producción)
4. Copia el **Client ID** y **Client secret**.

### Desarrollo local

```bash
cp .env.example .env.local
# rellena MONGODB_URI, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
npm install
npm run dev
```

Genera `AUTH_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Sin `MONGODB_URI`, la app levanta una MongoDB en memoria para desarrollo (los datos se pierden al reiniciar). El login con Google es necesario siempre, incluso en local. La primera vez que un usuario inicia sesión, se le crean automáticamente las categorías por defecto.

### Producción

1. Crea un cluster gratuito en [MongoDB Atlas](https://www.mongodb.com/atlas) (M0, 512MB) y permite el acceso desde cualquier IP (Vercel usa IPs dinámicas).
2. Despliega en [Vercel](https://vercel.com) conectando el repo.
3. Configura en Vercel las variables de entorno: `MONGODB_URI`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
4. Añade la URL de producción a los "Authorized redirect URIs" en Google Cloud Console (paso anterior).

### Tests

```bash
npm test
```
