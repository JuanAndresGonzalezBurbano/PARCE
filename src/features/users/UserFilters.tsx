import { Search, Filter } from 'lucide-react';
import { UserFilters as UserFiltersType } from './types';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFilterChange: (filters: UserFiltersType) => void;
}

export default function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Filter className="w-5 h-5 text-gold-500" />
        Filtros
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="input-field pl-10 w-full"
          />
        </div>

        {/* Filtro por Rol */}
        <div>
          <select
            value={filters.role || ''}
            onChange={(e) => onFilterChange({ 
              ...filters, 
              role: e.target.value ? e.target.value as 'user' | 'mechanic' | 'admin' : undefined 
            })}
            className="input-field w-full"
          >
            <option value="">Todos los roles</option>
            <option value="user">Usuario</option>
            <option value="mechanic">Mecánico</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Filtro por Estado */}
        <div>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ 
              ...filters, 
              status: e.target.value ? e.target.value as 'active' | 'inactive' : undefined 
            })}
            className="input-field w-full"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>
    </div>
  );
}
