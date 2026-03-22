'use client';

import { ChevronLeft, ChevronRight, Camera, Moon, Sun } from 'lucide-react';
import { useCameraStore } from '@/stores/cameraStore';
import { SearchFilter } from './SearchFilter';
import { CameraList } from './CameraList';
import type { Camera as CameraType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  cameras: CameraType[];
  roads: string[];
  isLoading: boolean;
}

export function Sidebar({ cameras, roads, isLoading }: SidebarProps) {
  const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode, filters } =
    useCameraStore();

  const favoritesCount = cameras.filter((c) =>
    useCameraStore.getState().favorites.includes(c.id)
  ).length;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute top-4 z-20 bg-white dark:bg-gray-800 p-2 rounded-r-lg shadow-lg transition-all duration-300',
          sidebarOpen ? 'left-80' : 'left-0'
        )}
        title={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'absolute top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-xl z-10 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-emerald-600" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Dublin Cameras
              </h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? (
              'Carregando...'
            ) : (
              <>
                {cameras.length} cameras
                {filters.showFavoritesOnly && ` (${favoritesCount} favoritas)`}
              </>
            )}
          </p>
        </div>

        {/* Search and Filters */}
        <SearchFilter roads={roads} cameras={cameras} />

        {/* Camera List */}
        <div className="flex-1 overflow-hidden">
          <CameraList cameras={cameras} isLoading={isLoading} />
        </div>
      </aside>
    </>
  );
}
