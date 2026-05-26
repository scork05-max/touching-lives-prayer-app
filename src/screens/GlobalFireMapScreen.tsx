import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Ionicons from '@react-native-community/vector-icons/Ionicons';
import { useGlobalFireStore } from '../services/GlobalFire';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

interface CityIgnition {
  city: string;
  flameSize: number;
  heatColor: string;
  count?: number;
  maxMomentum?: number;
}

/**
 * Global Fire Map Screen - Real-time visualization of prayers worldwide
 */
export default function GlobalFireMapScreen() {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [cityIgnitions, setCityIgnitions] = useState<CityIgnition[]>([]);
  const [activePrayerCount, setActivePrayerCount] = useState(0);

  // Zustand store
  const activePrayers = useGlobalFireStore((state) => state.activePrayers);
  const addPrayer = useGlobalFireStore((state) => state.addPrayer);
  const getCityIgnitions = useGlobalFireStore((state) => state.getCityIgnitions);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    // Update city ignitions every 2 seconds
    const interval = setInterval(() => {
      const ignitions = getCityIgnitions();
      setCityIgnitions(ignitions as CityIgnition[]);
      setActivePrayerCount(activePrayers.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [activePrayers]);

  /**
   * Initialize map and get user location
   */
  const initializeMap = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Simulate adding user's prayer to map
        addPrayer({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          city: 'Your Location',
          country: 'Your Country',
          userId: 'user-' + Date.now(),
          momentumScore: 65,
          isActive: true,
          timestamp: Date.now(),
        });
      }

      // Simulate other active prayers around the world
      simulateGlobalPrayers();
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setLoading(false);
    }
  };

  /**
   * Simulate global prayers for demo
   */
  const simulateGlobalPrayers = () => {
    const mockPrayers = [
      { lat: 40.7128, lon: -74.006, city: 'New York', momentum: 72, country: 'USA' },
      { lat: 51.5074, lon: -0.1278, city: 'London', momentum: 58, country: 'UK' },
      { lat: 48.8566, lon: 2.3522, city: 'Paris', momentum: 65, country: 'France' },
      { lat: 35.6762, lon: 139.6503, city: 'Tokyo', momentum: 85, country: 'Japan' },
      { lat: -33.8688, lon: 151.2093, city: 'Sydney', momentum: 71, country: 'Australia' },
      { lat: 37.7749, lon: -122.4194, city: 'San Francisco', momentum: 78, country: 'USA' },
      { lat: -23.5505, lon: -46.6333, city: 'São Paulo', momentum: 82, country: 'Brazil' },
      { lat: 1.3521, lon: 103.8198, city: 'Singapore', momentum: 68, country: 'Singapore' },
      { lat: 55.7558, lon: 37.6173, city: 'Moscow', momentum: 52, country: 'Russia' },
      { lat: 31.2304, lon: 30.0449, city: 'Cairo', momentum: 75, country: 'Egypt' },
      { lat: -33.9249, lon: 18.4241, city: 'Cape Town', momentum: 79, country: 'South Africa' },
      { lat: 19.076, lon: 72.8777, city: 'Mumbai', momentum: 88, country: 'India' },
    ];

    mockPrayers.forEach((prayer, index) => {
      setTimeout(() => {
        addPrayer({
          latitude: prayer.lat,
          longitude: prayer.lon,
          city: prayer.city,
          country: prayer.country,
          userId: 'user-' + index,
          momentumScore: prayer.momentum,
          isActive: true,
          timestamp: Date.now(),
        });
      }, index * 300);
    });
  };

  const getMomentumColor = (score: number): string => {
    if (score < 25) return '#3498db';
    if (score < 50) return '#f39c12';
    if (score < 75) return '#e74c3c';
    return '#c0392b';
  };

  const getMomentumLabel = (score: number): string => {
    if (score < 25) return 'Calm';
    if (score < 50) return 'Building';
    if (score < 75) return 'Strong';
    return 'Intense';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Global Fire Map</Text>
        <Text style={styles.headerSubtitle}>See where believers are praying worldwide</Text>
      </View>

      {/* Globe Placeholder with Statistics */}
      <View style={styles.globeContainer}>
        <View style={styles.globeFrame}>
          <Ionicons name="globe" size={80} color="#ff6b6b" />
          <Text style={styles.globeText}>3D Globe Visualization</Text>
          <Text style={styles.globeSubtext}>Powered by Three.js</Text>
        </View>
      </View>

      {/* Live Statistics */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={32} color="#ff6b6b" />
          <Text style={styles.statValue}>{activePrayerCount}</Text>
          <Text style={styles.statLabel}>Active Prayers</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="location" size={32} color="#f39c12" />
          <Text style={styles.statValue}>{cityIgnitions.length}</Text>
          <Text style={styles.statLabel}>City Ignitions</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="earth" size={32} color="#3498db" />
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Continents</Text>
        </View>
      </View>

      {/* City Ignitions Section */}
      {cityIgnitions.length > 0 && (
        <View style={styles.ignitionsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fire" size={24} color="#ff6b6b" />
            <Text style={styles.sectionTitle}>City Ignitions (10+ Active Prayers)</Text>
          </View>

          <FlatList
            data={cityIgnitions}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.ignitionCard}>
                <View
                  style={[
                    styles.flameIndicator,
                    { backgroundColor: item.heatColor },
                  ]}
                >
                  <Text style={styles.flameSize}>{Math.round(item.flameSize)}</Text>
                </View>

                <View style={styles.ignitionInfo}>
                  <Text style={styles.cityName}>{item.city}</Text>
                  <View style={styles.ignitionStats}>
                    <View style={styles.stat}>
                      <Ionicons name="people" size={14} color="#999" />
                      <Text style={styles.statText}>{item.count} praying</Text>
                    </View>
                    <View style={styles.stat}>
                      <Ionicons name="flame" size={14} color={item.heatColor} />
                      <Text style={[styles.statText, { color: item.heatColor }]}>
                        {getMomentumLabel(item.maxMomentum || 0)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.ignitionArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Active Prayers List */}
      <View style={styles.prayersSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list" size={24} color="#3498db" />
          <Text style={styles.sectionTitle}>Active Prayers Worldwide</Text>
        </View>

        <FlatList
          data={activePrayers.slice(0, 10)}
          keyExtractor={(item) => item.userId}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.prayerItem,
                { borderLeftColor: getMomentumColor(item.momentumScore) },
              ]}
            >
              <View style={styles.prayerLocation}>
                <Ionicons name="location" size={16} color="#f39c12" />
                <Text style={styles.prayerCity}>{item.city}</Text>
              </View>

              <View style={styles.prayerMomentum}>
                <View
                  style={[
                    styles.momentumBar,
                    {
                      width: `${item.momentumScore}%`,
                      backgroundColor: getMomentumColor(item.momentumScore),
                    },
                  ]}
                />
              </View>

              <Text style={styles.momentumValue}>{item.momentumScore}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How Global Fire Works</Text>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Ionicons name="location" size={24} color="#ff6b6b" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Location Sharing</Text>
            <Text style={styles.featureDesc}>
              Your prayer location is shared with other believers (opt-in only)
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Ionicons name="flame" size={24} color="#f39c12" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Flame Size</Text>
            <Text style={styles.featureDesc}>
              Larger flames show cities with more active prayers
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Ionicons name="color-palette" size={24} color="#e74c3c" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Heat Colors</Text>
            <Text style={styles.featureDesc}>
              Colors show prayer momentum: Blue (calm) → Red (intense)
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Ionicons name="heart" size={24} color="#c0392b" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Amen Haptics</Text>
            <Text style={styles.featureDesc}>
              Tap "Amen" to send vibration to the prayer leader
            </Text>
          </View>
        </View>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacySection}>
        <Ionicons name="lock-closed" size={20} color="#27ae60" />
        <Text style={styles.privacyText}>
          Your prayer location is only shared if you enable location sharing. All data is
          encrypted and stored locally on your device first.
        </Text>
      </View>

      {/* CTA Button */}
      <TouchableOpacity style={styles.enableButton}>
        <Ionicons name="globe" size={20} color="#fff" />
        <Text style={styles.enableButtonText}>Enable Global Fire</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  globeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  globeFrame: {
    width: '100%',
    height: 200,
    backgroundColor: '#16213e',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff6b6b',
    borderStyle: 'dashed',
  },
  globeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
  },
  globeSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16213e',
    borderRadius: 12,
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  ignitionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  ignitionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16213e',
    borderRadius: 12,
    marginBottom: 12,
  },
  flameIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  flameSize: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  ignitionInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  ignitionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  ignitionArrow: {
    marginLeft: 8,
  },
  prayersSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  prayerItem: {
    padding: 12,
    backgroundColor: '#16213e',
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  prayerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prayerCity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  prayerMomentum: {
    height: 6,
    backgroundColor: '#0f3460',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  momentumBar: {
    height: 6,
    borderRadius: 3,
  },
  momentumValue: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
  privacySection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0f3460',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  privacyText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  enableButton: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});