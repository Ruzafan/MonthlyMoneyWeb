# FinanceWeb — Diseño

## Objetivo
App personal de finanzas: registrar gastos/ingresos con categoría y tags, ver gráficos de gasto/ahorro filtrables, y presupuestos por categoría. Single-user por ahora, modelo preparado para multi-usuario futuro.

## Stack
- Next.js 15 (App Router, TypeScript)
- MongoDB Atlas (free tier) + Mongoose
- Server Actions para mutaciones, Zod para validación
- Recharts para gráficos
- Vercel para deploy
- Vitest para tests unitarios de agregaciones

## Modelo de datos

### Transaction
- type: "expense" | "income"
- amount: number (positivo)
- date: Date
- categoryId: ObjectId ref Category
- tags: string[]
- description?: string
- userId: string (fijo "default-user" por ahora)
- timestamps

### Category
- name: string
- type: "expense" | "income"
- color: string
- budgetLimit?: number (solo expense)
- userId: string

Tags son strings libres embebidos en Transaction, con autocompletado basado en tags existentes (no hay colección propia).

## Funcionalidades
1. Alta rápida de movimiento (importe, tipo, categoría, fecha) + detalles opcionales (tags, descripción).
2. Listado/tabla filtrable por fecha, categoría, tags, tipo.
3. Dashboard:
   - Gasto por categoría (donut/barras), filtrable por periodo.
   - Evolución mensual ingresos vs gastos vs ahorro.
   - Ahorro en € y % sobre ingresos, por mes.
   - Progreso gasto vs budgetLimit por categoría.
4. CRUD de categorías con límite de presupuesto opcional.

## Errores y validación
- Zod en cliente (react-hook-form) y servidor (Server Actions).
- Server Actions devuelven `{success, error}` tipado.

## Testing
- Vitest para funciones de cálculo de agregaciones (ahorro, %, totales).
- Sin e2e por ahora.

## UI
- Diseño limpio, moderno, usable. Prioridad a claridad de datos numéricos y gráficos.
