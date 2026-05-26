/**
 * Fire and Flame Animation Utilities
 * Provides animation sequences and effects for the Global Fire Map
 */

export interface FlameAnimation {
  frameIndex: number;
  totalFrames: number;
  intensity: number;
  scale: number;
  rotation: number;
}

/**
 * Generate flame pulse animation
 */
export function generateFlamePulse(timestamp: number, intensity: number): FlameAnimation {
  const frequency = 2; // Pulse frequency in Hz
  const phase = (timestamp * frequency) % 360;
  const normalizedPhase = phase / 360;

  // Create smooth pulsing effect
  const pulse = Math.sin(normalizedPhase * Math.PI * 2);
  const scale = 0.8 + pulse * 0.2 * (intensity / 100);

  return {
    frameIndex: Math.floor(normalizedPhase * 60),
    totalFrames: 60,
    intensity,
    scale,
    rotation: phase,
  };
}

/**
 * Generate flame particle effect
 */
export function generateFlameParticles(intensity: number, count: number = 5) {
  const particles = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const distance = 0.3 + Math.random() * 0.4;
    const velocity = (intensity / 100) * 2;

    particles.push({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 1.0,
      decay: 0.02,
    });
  }

  return particles;
}

/**
 * Generate city ignition bloom effect
 */
export function generateCityIgnitionBloom(intensity: number, timestamp: number) {
  const bloomWave = Math.sin((timestamp / 500) * Math.PI) * intensity;
  const bloomRadius = 20 + bloomWave * 10;
  const bloomOpacity = 0.3 + Math.sin((timestamp / 1000) * Math.PI) * 0.2;

  return {
    radius: bloomRadius,
    opacity: bloomOpacity,
    color: generateBloomColor(intensity),
  };
}

/**
 * Generate bloom color based on intensity
 */
function generateBloomColor(intensity: number) {
  if (intensity < 25) return '#3498db';
  if (intensity < 50) return '#f39c12';
  if (intensity < 75) return '#e74c3c';
  return '#c0392b';
}

/**
 * Easing function for smooth animations
 */
export const easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (t - 1) * (t - 1) * (t - 1) + 1,
  easeInSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
};

/**
 * Interpolate between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * Math.max(0, Math.min(1, t));
}

/**
 * Distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert latitude/longitude to Mercator projection
 */
export function latLonToMercator(lat: number, lon: number, width: number, height: number) {
  // Normalize longitude from -180 to 180
  const x = ((lon + 180) / 360) * width;

  // Convert latitude to radians
  const latRad = (lat * Math.PI) / 180;

  // Mercator projection
  const mercatorLat = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const mercatorLatNorm = (mercatorLat / Math.PI + 1) / 2;
  const y = (1 - mercatorLatNorm) * height;

  return { x, y };
}

/**
 * Create gradient for heat visualization
 */
export function createHeatmapGradient(intensity: number): string[] {
  // Return color gradient from cold to hot
  const colors = [
    '#3498db', // Blue (0-25)
    '#2ecc71', // Green (25-50)
    '#f39c12', // Yellow (50-75)
    '#e74c3c', // Orange (75-100)
    '#c0392b', // Red (100+)
  ];

  const index = Math.floor((intensity / 100) * (colors.length - 1));
  return [colors[Math.max(0, index - 1)], colors[index]].filter(Boolean);
}
