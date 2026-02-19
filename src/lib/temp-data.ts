
export type TemperatureReading = {
  id: string;
  timestamp: string;
  value: number;
};

// Generates mock data for the last 24 hours
export function generateDailyMockData(): TemperatureReading[] {
  const data: TemperatureReading[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: time.toISOString(),
      value: 20 + Math.random() * 10,
    });
  }
  return data;
}

export const STORAGE_KEYS = {
  THRESHOLD: 'tempalert_threshold',
  HISTORY: 'tempalert_history',
};

export function getThreshold(): number {
  if (typeof window === 'undefined') return 30;
  const stored = localStorage.getItem(STORAGE_KEYS.THRESHOLD);
  return stored ? parseFloat(stored) : 30;
}

export function setThreshold(value: number) {
  localStorage.setItem(STORAGE_KEYS.THRESHOLD, value.toString());
}
