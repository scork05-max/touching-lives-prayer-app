/**
 * Heatmap Generator for Global Fire Map
 * Generates visual heatmap data for prayer intensity visualization
 */

export interface HeatmapPoint {
  x: number;
  y: number;
  value: number; // 0-100 intensity
  radius: number;
  color: string;
}

export interface HeatmapConfig {
  width: number;
  height: number;
  radius: number;
  blur: number;
  gradient: { [key: string]: string };
}

/**
 * Generate heatmap points from prayers
 */
export function generateHeatmapPoints(
  prayers: Array<{ latitude: number; longitude: number; momentumScore: number }>,
  config: HeatmapConfig
): HeatmapPoint[] {
  return prayers.map((prayer) => {
    const { x, y } = latLonToScreenCoords(
      prayer.latitude,
      prayer.longitude,
      config.width,
      config.height
    );

    return {
      x,
      y,
      value: prayer.momentumScore,
      radius: config.radius,
      color: getMomentumColor(prayer.momentumScore),
    };
  });
}

/**
 * Convert lat/lon to screen coordinates (Mercator projection)
 */
function latLonToScreenCoords(
  lat: number,
  lon: number,
  width: number,
  height: number
): { x: number; y: number } {
  // Normalize longitude from -180 to 180
  const x = ((lon + 180) / 360) * width;

  // Mercator projection for latitude
  const latRad = (lat * Math.PI) / 180;
  const mercatorLat = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const mercatorLatNorm = (mercatorLat / Math.PI + 1) / 2;
  const y = (1 - mercatorLatNorm) * height;

  return { x, y };
}

/**
 * Get color based on momentum
 */
function getMomentumColor(momentum: number): string {
  if (momentum < 25) return '#3498db';
  if (momentum < 50) return '#f39c12';
  if (momentum < 75) return '#e74c3c';
  return '#c0392b';
}

/**
 * Generate heatmap gradient
 */
export function generateGradient(): { [key: string]: string } {
  return {
    '0.0': '#3498db',  // Blue - cold
    '0.25': '#2ecc71', // Green
    '0.5': '#f39c12',  // Yellow
    '0.75': '#e74c3c', // Orange
    '1.0': '#c0392b',  // Red - hot
  };
}

/**
 * Create canvas-based heatmap visualization
 */
export function createCanvasHeatmap(
  canvas: HTMLCanvasElement,
  points: HeatmapPoint[],
  config: HeatmapConfig
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, config.width, config.height);

  // Draw heatmap points
  points.forEach((point) => {
    const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius);
    gradient.addColorStop(0, adjustColorAlpha(point.color, 0.8));
    gradient.addColorStop(1, adjustColorAlpha(point.color, 0));

    ctx.fillStyle = gradient;
    ctx.fillRect(
      point.x - point.radius,
      point.y - point.radius,
      point.radius * 2,
      point.radius * 2
    );
  });

  // Apply blur effect
  if (config.blur > 0) {
    ctx.filter = `blur(${config.blur}px)`;
  }
}

/**
 * Adjust color alpha
 */
function adjustColorAlpha(color: string, alpha: number): string {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Calculate heatmap intensity at specific coordinates
 */
export function getHeatmapIntensity(
  x: number,
  y: number,
  points: HeatmapPoint[],
  maxDistance: number = 100
): number {
  let totalIntensity = 0;
  let totalWeight = 0;

  points.forEach((point) => {
    const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));

    if (distance < maxDistance) {
      const weight = 1 - distance / maxDistance;
      totalIntensity += point.value * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? totalIntensity / totalWeight : 0;
}

/**
 * Get hotspots from heatmap
 */
export function getHotspots(points: HeatmapPoint[], threshold: number = 50): HeatmapPoint[] {
  return points.filter((p) => p.value >= threshold);
}
