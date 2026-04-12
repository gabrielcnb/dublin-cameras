'use client';

import { Search, X, Heart, Filter, Wifi, MapPin } from 'lucide-react';
import { useCameraStore } from '@/stores/cameraStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { Camera } from '@/lib/types';

interface SearchFilterProps {
  roads: string[];
  cameras: Camera[];
}

export function SearchFilter({ roads, cameras }: SearchFilterProps) {
  const { filters, setFilters, resetFilters, showOnlineOnly, toggleShowOnlineOnly, offlineCameras, userLocation, setUserLocation } = useCameraStore();
  const [showFilters, setShowFilters] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleNearMe = () => {
    if (userLocation) {
      setUserLocation(null);
      return;
    }
    if (!navigator.geolocation) return;
    const consent = window.confirm(
      'Para filtrar câmeras próximas, precisamos acessar sua localização. Seus dados de localização NÃO são armazenados em nosso servidor. Deseja continuar?'
    );
    if (!consent) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onlineCount = cameras.length - offlineCameras.length;

  const hasActiveFilters =
    filters.search || filters.roads.length > 0 || filters.showFavoritesOnly || showOnlineOnly || !!userLocation;

  const toggleRoad = (road: string) => {
    const newRoads = filters.roads.includes(road)
      ? filters.roads.filter((r) => r !== road)
      : [...filters.roads, road];
    setFilters({ roads: newRoads });
  };

  return (
    <div className="p-4 border-b dark:border-gray-700 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar camera..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        {filters.search && (
          <button
            onClick={() => setFilters({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilters({ showFavoritesOnly: !filters.showFavoritesOnly })}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
            filters.showFavoritesOnly
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          <Heart
            className={cn('w-4 h-4', filters.showFavoritesOnly && 'fill-current')}
          />
          Favoritas
        </button>

        <button
          onClick={toggleShowOnlineOnly}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
            showOnlineOnly
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          <Wifi className="w-4 h-4" />
          Online
          {cameras.length > 0 && (
            <span className={cn(
              'text-xs px-1.5 rounded-full',
              showOnlineOnly
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            )}>
              {onlineCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
            showFilters || filters.roads.length > 0
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {filters.roads.length > 0 && (
            <span className="bg-emerald-600 text-white text-xs px-1.5 rounded-full">
              {filters.roads.length}
            </span>
          )}
        </button>

        <button
          onClick={handleNearMe}
          disabled={locating}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
            userLocation
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
          title={userLocation ? 'Clique para desativar filtro de proximidade' : 'Mostrar câmeras num raio de 5 km'}
        >
          <MapPin className={cn('w-4 h-4', locating && 'animate-pulse')} />
          {locating ? 'Localizando...' : userLocation ? 'Perto de mim ✕' : 'Perto de mim'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => { resetFilters(); setUserLocation(null); }}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Road Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {roads.map((road) => (
            <button
              key={road}
              onClick={() => toggleRoad(road)}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors',
                filters.roads.includes(road)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {road}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
