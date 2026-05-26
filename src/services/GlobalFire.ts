import create from 'zustand';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  userId: string;
  momentumScore: number;
  isActive: boolean;
  timestamp: number;
}

interface GlobalFireStore {
  activePrayers: LocationData[];
  cityStats: Map<string, { count: number; heatLevel: number }>;
  addPrayer: (prayer: LocationData) => void;
  removePrayer: (userId: string) => void;
  updateMomentum: (userId: string, score: number) => void;
  getHeatmapData: () => LocationData[];
  getCityIgnitions: () => Array<{ city: string; flameSize: number; heatColor: string; count?: number; maxMomentum?: number }>;
  clearExpiredPrayers: () => void;
}

/**
 * Global Fire Map Store - Real-time prayer location tracking
 * Uses Zustand for state management with prayer aggregation by city
 */
export const useGlobalFireStore = create<GlobalFireStore>((set, get) => ({
  activePrayers: [],
  cityStats: new Map(),

  addPrayer: (prayer: LocationData) =>
    set((state) => ({
      activePrayers: [...state.activePrayers, prayer],
    })),

  removePrayer: (userId: string) =>
    set((state) => ({
      activePrayers: state.activePrayers.filter((p) => p.userId !== userId),
    })),

  updateMomentum: (userId: string, score: number) =>
    set((state) => ({
      activePrayers: state.activePrayers.map((p) =>
        p.userId === userId ? { ...p, momentumScore: score } : p
      ),
    })),

  getHeatmapData: () => {
    const state = get();
    return state.activePrayers.filter((p) => p.isActive);
  },

  getCityIgnitions: () => {
    const state = get();
    const cityMap = new Map<string, { count: number; maxMomentum: number }>();

    // Aggregate prayers by city
    state.activePrayers.forEach((prayer) => {
      const city = prayer.city || 'Unknown';
      const existing = cityMap.get(city) || { count: 0, maxMomentum: 0 };
      cityMap.set(city, {
        count: existing.count + 1,
        maxMomentum: Math.max(existing.maxMomentum, prayer.momentumScore),
      });
    });

    // Generate ignition visualizations for cities with 10+ active prayers
    return Array.from(cityMap.entries())
      .filter(([_, data]) => data.count >= 10)
      .map(([city, data]) => ({
        city,
        flameSize: Math.min(data.count * 2, 100), // Scale flame size with prayer count
        heatColor: generateHeatColor(data.maxMomentum),
        count: data.count,
        maxMomentum: data.maxMomentum,
      }));
  },

  clearExpiredPrayers: () => {
    const now = Date.now();
    const PRAYER_TIMEOUT = 60 * 60 * 1000; // 1 hour

    set((state) => ({
      activePrayers: state.activePrayers.filter(
        (p) => now - p.timestamp < PRAYER_TIMEOUT
      ),
    }));
  },
}));

/**
 * Generate heat color based on momentum score (0-100)
 * Blue (cold) -> Red (hot)
 */
export function generateHeatColor(momentumScore: number): string {
  // Normalize to 0-1
  const normalized = momentumScore / 100;

  if (normalized < 0.25) {
    // Cool blues
    return '#3498db';
  } else if (normalized < 0.5) {
    // Warm greens and yellows
    return '#f39c12';
  } else if (normalized < 0.75) {
    // Orange
    return '#e74c3c';
  } else {
    // Hot reds
    return '#c0392b';
  }
}

/**
 * Three.js Globe Visualization for Global Fire Map
 * This is a framework for Three.js integration
 */
export class GlobalFireGlobe {
  private canvas: HTMLCanvasElement | null = null;
  private scene: any = null; // THREE.Scene
  private camera: any = null; // THREE.Camera
  private renderer: any = null; // THREE.Renderer
  private globe: any = null; // THREE.Sphere for globe
  private flameParticles: any[] = [];
  private animationFrameId: number | null = null;

  /**
   * Initialize Three.js scene for globe visualization
   */
  async initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Dynamic import of Three.js
    // In production, this would be integrated with expo-three or a web view
    console.log('Initializing 3D globe with Three.js');
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

    // Placeholder - actual implementation requires Three.js integration
    // For React Native, this could be done with:
    // 1. Expo Three (expo-three)
    // 2. WebGL via react-native-webgl
    // 3. Babylon.js
    // 4. Custom OpenGL implementation
  }

  /**
   * Add flame visualization at coordinates
   */
  addFlame(lat: number, lon: number, momentumScore: number) {
    const flameSize = (momentumScore / 100) * 2; // Scale 0-2
    const heatColor = generateHeatColor(momentumScore);

    // Create flame particle at lat/lon
    const flame = {
      latitude: lat,
      longitude: lon,
      size: flameSize,
      color: heatColor,
      intensity: momentumScore,
      createdAt: Date.now(),
      scale: 1.0,
    };

    this.flameParticles.push(flame);

    // Auto-remove flame after 10 seconds
    setTimeout(() => {
      this.flameParticles = this.flameParticles.filter((f) => f !== flame);
    }, 10000);
  }

  /**
   * Update flame position and momentum
   */
  updateFlame(lat: number, lon: number, momentumScore: number) {
    const existingFlame = this.flameParticles.find(
      (f) => f.latitude === lat && f.longitude === lon
    );

    if (existingFlame) {
      existingFlame.size = (momentumScore / 100) * 2;
      existingFlame.intensity = momentumScore;
      existingFlame.color = generateHeatColor(momentumScore);
    }
  }

  /**
   * Remove flame from visualization
   */
  removeFlame(lat: number, lon: number) {
    this.flameParticles = this.flameParticles.filter(
      (f) => f.latitude !== lat || f.longitude !== lon
    );
  }

  /**
   * Get visible flame particles (within viewport)
   */
  getVisibleFlames() {
    return this.flameParticles.filter((f) => f.intensity > 0);
  }

  /**
   * Animate flames with pulsing effect
   */
  animateFlames() {
    this.flameParticles.forEach((flame) => {
      const time = Date.now() - flame.createdAt;
      const pulseFactor = Math.sin(time / 200) * 0.2 + 0.9;
      flame.scale = pulseFactor;
    });
  }

  /**
   * Render frame
   */
  render() {
    if (this.renderer && this.scene && this.camera) {
      // Update particle positions and render
      this.animateFlames();
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Handle window resize
   */
  onWindowResize(width: number, height: number) {
    if (this.camera && this.renderer) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  /**
   * Convert lat/lon to 3D coordinates on sphere
   */
  latLonToXYZ(lat: number, lon: number, radius: number = 1) {
    const phi = (lat * Math.PI) / 180; // Convert to radians
    const theta = (lon * Math.PI) / 180; // Convert to radians

    const x = radius * Math.cos(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi);
    const z = radius * Math.cos(phi) * Math.sin(theta);

    return { x, y, z };
  }

  /**
   * Start animation loop
   */
  startAnimation() {
    const animate = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Stop animation loop
   */
  stopAnimation() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.stopAnimation();
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.flameParticles = [];
  }
}

/**
 * Location Service - Handle geolocation and city lookup
 */
export class LocationService {
  /**
   * Get user's current location
   */
  static async getCurrentLocation() {
    // Placeholder - use expo-location in production
    return {
      latitude: 0,
      longitude: 0,
    };
  }

  /**
   * Get city name from coordinates
   */
  static async getCityFromCoordinates(lat: number, lon: number): Promise<string> {
    // Placeholder - use reverse geocoding API in production
    const mockCities: { [key: string]: string } = {
      '40.7128,-74.006': 'New York',
      '51.5074,-0.1278': 'London',
      '48.8566,2.3522': 'Paris',
      '35.6762,139.6503': 'Tokyo',
    };
    return mockCities[`${lat},${lon}`] || 'Unknown City';
  }
}

// Create singleton instance
export const globalFireGlobe = new GlobalFireGlobe();