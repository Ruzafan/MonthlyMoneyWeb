## Finanzas personales

App de finanzas personales: registra gastos e ingresos con categoría y tags, visualiza gráficos de gasto/ahorro filtrables y define presupuestos por categoría.

Stack: Next.js 15 (App Router) + MongoDB Atlas (Mongoose) + Recharts + Tailwind CSS v4.

### Desarrollo local

```bash
npm install
npm run dev
```

No necesitas configurar `MONGODB_URI` para desarrollar: si no está definida, la app levanta automáticamente una MongoDB en memoria (los datos se pierden al reiniciar) y la siembra con categorías y movimientos de ejemplo.

### Producción

1. Crea un cluster gratuito en [MongoDB Atlas](https://www.mongodb.com/atlas) (M0, 512MB).
2. Copia `.env.example` a `.env.local` y añade tu `MONGODB_URI`.
3. Despliega en [Vercel](https://vercel.com) conectando el repo y configurando `MONGODB_URI` como variable de entorno.

### Tests

```bash
npm test
```
"# MonthlyMoneyWeb" 
