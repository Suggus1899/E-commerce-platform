# E-commerce Platform — notas de proyecto

Microservicios Spring Boot (Java 17 / Spring Boot 3.2.4 / Spring Cloud 2023.0.1)
+ frontend Next.js (App Router, TypeScript, Tailwind) + nginx gateway.

## Servicios

| Servicio | Puerto interno | Stack | Rol |
|---|---|---|---|
| eureka-server | 8761 | Eureka | Service discovery |
| nginx-gateway | 80 | nginx | Gateway único (`/api/**`, `/uploads/**`) |
| user-service | 8080 (8081 host) | Postgres + JPA | Auth (JWT), usuarios |
| product-service | 8080 (8082 host) | MongoDB | Catálogo, categorías, uploads de imágenes |
| cart-service | 8080 (8083 host) | Redis | Carrito (invitado o logueado) |
| order-service | 8080 (8084 host) | Postgres + RabbitMQ | Fuera de alcance del MVP actual (no tocado) |
| notification-service | 8080 (8085 host) | RabbitMQ | Fuera de alcance del MVP actual (no tocado) |
| frontend | 3000 (dev) | Next.js 16 | Tienda pública + panel admin |

## Comandos de verificación

Backend (por cada servicio tocado: `user-service`, `product-service`, `cart-service`):
```
mvn -q -DskipTests compile
```

Frontend:
```
cd frontend
npm run build
```

Validar sintaxis de `docker-compose.yml` sin necesitar el daemon corriendo:
```
docker compose config -q
```

Levantar todo (requiere Docker Desktop corriendo):
```
docker compose up --build
```

## Variables de entorno

Ver `.env.example` en la raíz (backend/Docker Compose) y `frontend/.env.local.example`
(Next.js). Puntos clave:

- `JWT_SECRET`: **debe ser el mismo valor** en `user-service`, `product-service` y
  `cart-service`. `user-service` firma tokens HS256 con este secret; los otros dos
  solo los validan (no hay librería compartida, es duplicación intencional documentada
  en el plan original).
- `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD`: usados por
  `user-service/.../config/AdminBootstrap.java` para crear el usuario ADMIN inicial
  si no existe, al arrancar.
- `APP_UPLOAD_DIR`: carpeta donde `product-service` guarda las imágenes subidas
  (`/data/uploads` dentro del contenedor, volumen `uploads-data` compartido de
  solo-lectura con `nginx-gateway`, que las sirve en `/uploads/**`).
- `NEXT_PUBLIC_API_URL`: base del gateway nginx (sin `/api`), usada por el frontend
  tanto en Server Components (lecturas públicas de catálogo) como en los Route
  Handlers puente.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: número E.164 sin `+` para los links `wa.me`.

## Contrato JWT (importante si se agregan más servicios)

- jjwt 0.12.5, HS256 forzado explícitamente en la generación
  (`signWith(key, Jwts.SIG.HS256)`) — el secret Base64 por defecto decodifica a más
  de 256 bits, así que sin forzar el algoritmo jjwt auto-seleccionaría HS512 y
  rompería la validación en los otros servicios.
- Claims: `subject` = username, `role` (String: `CUSTOMER`/`ADMIN`), `userId`
  (String, no Long, para evitar problemas de deserialización Integer/Long de Jackson).
- Validación en `product-service`/`cart-service`: `Jwts.parser().verifyWith(key).build()...`
  (no fuerza algoritmo, lee el `alg` del header del token).

## Autenticación en el frontend

El JWT nunca llega al JS del navegador: vive en una cookie `auth_token`
(httpOnly, `sameSite=lax`, `secure` en producción). Los Route Handlers de
`frontend/app/api/**` la leen server-side y reenvían `Authorization: Bearer <token>`
al backend real (`frontend/lib/serverProxy.ts`). `proxy.ts` (reemplazo de
`middleware.ts` en Next.js 16) solo gatea UX en `/admin/**`; el control de rol
real lo hace cada microservicio Java.

## Carrito: resolución de `cartId`

- Logueado: el frontend siempre pega a `cartId = "me"`; `cart-service` lo
  resuelve a `"user:" + userId` usando el JWT. Sin JWT válido, `"me"` devuelve 401.
- Invitado: UUID generado en el cliente (`crypto.randomUUID()`), persistido en
  `localStorage` (`guest_cart_id`). No hay merge de carrito invitado → usuario logueado.

## Datos de prueba (seed)

Con el stack levantado (`docker-compose up --build`), corré:
```
node scripts/seed-demo-data.mjs
```
Crea 2 categorías raíz + 1 subcategoría, 5 productos de ejemplo (con
`featured`/`onSale`/`isNew` variados para poblar la home) y un usuario cliente
de prueba (`cliente1` / `Cliente123!`). Usa `API_URL`, `ADMIN_USERNAME`,
`ADMIN_PASSWORD` como env vars opcionales si cambiaste los defaults.

## Páginas del frontend

Además de las páginas del plan original (home, categoría, producto, carrito,
login/registro, admin), se agregaron:
- `app/not-found.tsx`: 404 personalizado.
- `app/categorias/page.tsx`: índice de todas las categorías/subcategorías
  (enlazado desde el header, tanto desktop como mobile).
- `app/mi-cuenta/page.tsx`: perfil de solo lectura del cliente logueado
  (username/email/rol); gateada por `proxy.ts` igual que `/admin/**`.
  No incluye edición de perfil ni cambio de contraseña (no hay endpoint en
  `user-service` para eso todavía).

## Fuera de alcance (decisión de diseño del MVP)

`order-service` y `notification-service` no se tocan: el checkout se cierra por
WhatsApp, fuera del sistema. Si más adelante se pide historial de pedidos, la
base (`Order`, `OrderProducer`, `NotificationListener`) ya existe en el scaffold.
