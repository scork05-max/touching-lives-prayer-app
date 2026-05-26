/**
 * Global Fire Map Utility Functions
 * Helper functions for map calculations and data processing
 */

export interface Prayer {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  userId: string;
  momentumScore: number;
  timestamp: number;
}

export interface CityCluster {
  city: string;
  latitude: number;
  longitude: number;
  prayerCount: number;
  avgMomentum: number;
  maxMomentum: number;
}

/**
 * Cluster prayers by city
 */
export function clusterPrayersByCity(prayers: Prayer[]): CityCluster[] {
  const clusters = new Map<string, Prayer[]>();

  // Group prayers by city
  prayers.forEach((prayer) => {
    const key = prayer.city;
    if (!clusters.has(key)) {
      clusters.set(key, []);
    }
    clusters.get(key)!.push(prayer);
  });

  // Calculate statistics for each cluster
  const cityStats: CityCluster[] = [];
  clusters.forEach((prayersInCity, city) => {
    const momentumScores = prayersInCity.map((p) => p.momentumScore);
    const avgMomentum = momentumScores.reduce((a, b) => a + b, 0) / momentumScores.length;
    const maxMomentum = Math.max(...momentumScores);
    const { latitude, longitude, country } = prayersInCity[0];

    cityStats.push({
      city,
      latitude,
      longitude,
      prayerCount: prayersInCity.length,
      avgMomentum,
      maxMomentum,
    });
  });

  return cityStats;
}

/**
 * Get ignitions (cities with 10+ prayers)
 */
export function getIgnitions(clusters: CityCluster[]) {
  return clusters.filter((cluster) => cluster.prayerCount >= 10);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Get nearby prayers
 */
export function getNearbyPrayers(prayer: Prayer, prayers: Prayer[], radiusKm: number = 50) {
  return prayers.filter(
    (p) =>
      haversineDistance(prayer.latitude, prayer.longitude, p.latitude, p.longitude) <=
      radiusKm
  );
}

/**
 * Filter prayers by momentum threshold
 */
export function filterByMomentum(prayers: Prayer[], minMomentum: number, maxMomentum?: number) {
  return prayers.filter((p) => {
    if (maxMomentum !== undefined) {
      return p.momentumScore >= minMomentum && p.momentumScore <= maxMomentum;
    }
    return p.momentumScore >= minMomentum;
  });
}

/**
 * Sort prayers by momentum (descending)
 */
export function sortByMomentum(prayers: Prayer[]) {
  return [...prayers].sort((a, b) => b.momentumScore - a.momentumScore);
}

/**
 * Get top prayers by momentum
 */
export function getTopPrayers(prayers: Prayer[], count: number = 10) {
  return sortByMomentum(prayers).slice(0, count);
}

/**
 * Get recent prayers
 */
export function getRecentPrayers(prayers: Prayer[], minutesBack: number = 30) {
  const timeThreshold = Date.now() - minutesBack * 60 * 1000;
  return prayers.filter((p) => p.timestamp > timeThreshold);
}

/**
 * Calculate continent for coordinates
 */
export function getContinent(lat: number, lon: number): string {
  if (lat > 50 && lon > -10 && lon < 40) return 'Europe';
  if (lat > 30 && lat < 75 && lon > 60 && lon < 180) return 'Asia';
  if (lat < 10 && lat > -35 && lon > 10 && lon < 55) return 'Africa';
  if (lat < 10 && lat > -56 && lon > 113 && lon < 180) return 'Oceania';
  if (lat > -10 && lat < 70 && lon > -170 && lon < -40) return 'North America';
  if (lat > -56 && lat < -10 && lon > -82 && lon < -34) return 'South America';
  return 'Unknown';
}

/**
 * Get statistics for prayers
 */
export function getPrayerStatistics(prayers: Prayer[]) {
  if (prayers.length === 0) {
    return {
      totalPrayers: 0,
      avgMomentum: 0,
      maxMomentum: 0,
      minMomentum: 0,
      totalCities: 0,
      continents: new Set<string>(),
    };
  }

  const momentumScores = prayers.map((p) => p.momentumScore);
  const cities = new Set(prayers.map((p) => p.city));
  const continents = new Set(prayers.map((p) => getContinent(p.latitude, p.longitude)));

  return {
    totalPrayers: prayers.length,
    avgMomentum: momentumScores.reduce((a, b) => a + b, 0) / prayers.length,
    maxMomentum: Math.max(...momentumScores),
    minMomentum: Math.min(...momentumScores),
    totalCities: cities.size,
    continents,
  };
}
