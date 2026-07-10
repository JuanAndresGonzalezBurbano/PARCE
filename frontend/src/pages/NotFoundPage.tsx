import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-gray-700 mb-4">404</h1>
        <p className="text-2xl font-semibold text-white mb-2">Página no encontrada</p>
        <p className="text-gray-400 mb-8">La página que buscas no existe o fue movida.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
