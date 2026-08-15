#!/usr/bin/env node
/**
 * Seed de datos de demo para probar la tienda de punta a punta.
 *
 * Requiere que el stack esté levantado (`docker-compose up --build`) y que
 * el gateway nginx responda en API_URL (por defecto http://localhost).
 *
 * Uso:
 *   node scripts/seed-demo-data.mjs
 *
 * Variables de entorno opcionales:
 *   API_URL          (default: http://localhost)
 *   ADMIN_USERNAME    (default: admin)       -> debe coincidir con el admin bootstrap
 *   ADMIN_PASSWORD    (default: ChangeMe123!) -> idem
 *
 * Qué hace:
 *   1. Login como ADMIN (creado automáticamente por user-service al arrancar).
 *   2. Crea 2 categorías raíz + 1 subcategoría.
 *   3. Crea 5 productos de ejemplo repartidos en esas categorías
 *      (algunos featured / onSale / isNew para poblar la home).
 *   4. Registra un usuario cliente de prueba (cliente1 / Cliente123!) para
 *      probar login/carrito/checkout por WhatsApp sin usar la cuenta admin.
 *
 * Es idempotente en la práctica: si volvés a correrlo se crean categorías y
 * productos duplicados con slugs distintos (el backend genera un slug único
 * agregando un sufijo). Si eso te molesta, borrá las colecciones de Mongo
 * (`products`, `categories`) antes de re-sembrar.
 */

const API_URL = process.env.API_URL ?? "http://localhost";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

async function jsonFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} -> ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  console.log(`Usando API_URL=${API_URL}`);

  console.log(`Iniciando sesión como admin ("${ADMIN_USERNAME}")...`);
  const { token } = await jsonFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log("Login OK.");

  console.log("Creando categorías...");
  const ropa = await jsonFetch("/api/admin/categories", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ name: "Ropa", parentId: null }),
  });
  const remeras = await jsonFetch("/api/admin/categories", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ name: "Remeras", parentId: ropa.id }),
  });
  const accesorios = await jsonFetch("/api/admin/categories", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ name: "Accesorios", parentId: null }),
  });
  console.log(`  - ${ropa.name} (${ropa.id})`);
  console.log(`    - ${remeras.name} (${remeras.id})`);
  console.log(`  - ${accesorios.name} (${accesorios.id})`);

  const products = [
    {
      name: "Remera Básica Blanca",
      description: "Remera de algodón 100%, corte clásico, ideal para el día a día.",
      sku: "REM-001",
      price: 12000,
      salePrice: null,
      stock: 25,
      categoryId: remeras.id,
      attributes: { talle: "M", color: "Blanco", marca: "Genérica" },
      featured: true,
      onSale: false,
      isNew: false,
    },
    {
      name: "Remera Estampada Negra",
      description: "Remera negra con estampado exclusivo, tela premium.",
      sku: "REM-002",
      price: 15000,
      salePrice: 11900,
      stock: 15,
      categoryId: remeras.id,
      attributes: { talle: "L", color: "Negro", marca: "Genérica" },
      featured: false,
      onSale: true,
      isNew: false,
    },
    {
      name: "Remera Oversize Gris",
      description: "Remera oversize de moda, tela pesada, no se deforma.",
      sku: "REM-003",
      price: 16500,
      salePrice: null,
      stock: 30,
      categoryId: remeras.id,
      attributes: { talle: "XL", color: "Gris", marca: "Genérica" },
      featured: false,
      onSale: false,
      isNew: true,
    },
    {
      name: "Gorra Snapback",
      description: "Gorra ajustable con visera plana, unisex.",
      sku: "ACC-001",
      price: 9000,
      salePrice: null,
      stock: 40,
      categoryId: accesorios.id,
      attributes: { color: "Negro" },
      featured: true,
      onSale: false,
      isNew: true,
    },
    {
      name: "Mochila Urbana",
      description: "Mochila resistente al agua, compartimento acolchado para notebook.",
      sku: "ACC-002",
      price: 28000,
      salePrice: 22000,
      stock: 10,
      categoryId: accesorios.id,
      attributes: { color: "Azul", capacidad: "20L" },
      featured: true,
      onSale: true,
      isNew: false,
    },
  ];

  console.log("Creando productos...");
  for (const product of products) {
    const created = await jsonFetch("/api/admin/products", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(product),
    });
    console.log(`  - ${created.name} (slug: ${created.slug})`);
  }

  console.log("Registrando cliente de prueba (cliente1 / Cliente123!)...");
  try {
    await jsonFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: "cliente1",
        email: "cliente1@example.com",
        password: "Cliente123!",
      }),
    });
    console.log("  Cliente de prueba creado.");
  } catch (err) {
    console.log(`  (omitido, probablemente ya existe: ${err.message})`);
  }

  console.log("\nListo. Probá:");
  console.log(`  ${API_URL.replace("http://localhost", "http://localhost:3000")} (frontend, si corre aparte con npm run dev)`);
  console.log(`  ${API_URL}/api/products?featured=true`);
  console.log(`  ${API_URL}/api/categories`);
}

main().catch((err) => {
  console.error("\nFalló el seed:", err.message);
  process.exit(1);
});
