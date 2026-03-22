import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function extractRoadFromName(name: string): string {
  const match = name.match(/^([A-Z]\d+)/);
  return match ? match[1] : 'Other';
}

export function getUniqueRoads(cameras: { road: string }[]): string[] {
  const roads = new Set(cameras.map(c => c.road));
  return Array.from(roads).sort();
}
