export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-12 py-8 text-sm text-gray-500">
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} Mi Tienda. Todos los derechos reservados.</p>
        <p>Hecho con Next.js</p>
      </div>
    </footer>
  );
}
