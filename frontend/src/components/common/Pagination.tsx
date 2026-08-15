interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

/**
 * Controles Anterior/Siguiente + indicador de página, para los listados
 * admin-wide paginados (ratings, PQR, surveys). No se renderiza nada si hay
 * una sola página (o ninguna) — evita ruido visual quo un listado corto.
 */
export default function Pagination({ page, totalPages, total, onPageChange, disabled = false }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/50">
      <p className="text-gray-500 text-xs">
        Página {page} de {totalPages} · {total} en total
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || isFirstPage}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
        >
          ← Anterior
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || isLastPage}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
