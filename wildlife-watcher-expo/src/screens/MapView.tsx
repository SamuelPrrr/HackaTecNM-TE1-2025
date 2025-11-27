import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapPin, TrendingUp } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Badge } from '../components/Badge';
import { colors, spacing, borderRadius } from '../theme/colors';

const { width } = Dimensions.get('window');

const MapViewScreen = () => {
  const detections = [
    { lat: 51.505, lng: -0.09, species: 'Red Fox', count: 5 },
    { lat: 51.51, lng: -0.1, species: 'Barn Owl', count: 2 },
    { lat: 51.51, lng: -0.08, species: 'European Badger', count: 3 },
  ];

  const topSpecies = [
    { name: 'Red Fox', count: 47, trend: '+12%' },
    { name: 'European Badger', count: 34, trend: '+5%' },
    { name: 'Barn Owl', count: 28, trend: '+8%' },
    { name: 'Roe Deer', count: 23, trend: '+3%' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Demographic Map</Text>
        <Text style={styles.subtitle}>Species distribution and detection patterns</Text>
      </View>

      {/* Map Card */}
      <Card style={styles.mapCard}>
        <CardHeader style={styles.mapHeader}>
          <View style={styles.mapHeaderContent}>
            <View>
              <CardTitle style={styles.mapTitle}>Live Detection Map</CardTitle>
              <CardDescription>Real-time location data from all sensors</CardDescription>
            </View>
          </View>
        </CardHeader>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 51.505,
              longitude: -0.09,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {detections.map((detection, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: detection.lat,
                  longitude: detection.lng,
                }}
                pinColor={colors.primary}
                title={detection.species}
                description={`${detection.count} detections`}
              />
            ))}
          </MapView>
        </View>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <CardContent style={styles.statContent}>
            <View style={styles.statIconRow}>
              <MapPin size={16} color={colors.primary} />
              <Text style={styles.statLabel}>Active Locations</Text>
            </View>
            <Text style={styles.statValue}>12</Text>
          </CardContent>
        </Card>

        <Card style={styles.statCard}>
          <CardContent style={styles.statContent}>
            <View style={styles.statIconRow}>
              <TrendingUp size={16} color={colors.success} />
              <Text style={styles.statLabel}>Detections Today</Text>
            </View>
            <Text style={styles.statValue}>47</Text>
          </CardContent>
        </Card>
      </View>

      {/* Top Species */}
      <Card style={styles.card}>
        <CardHeader>
          <CardTitle style={styles.sectionTitle}>Most Detected Species</CardTitle>
          <CardDescription>By frequency in the monitored area</CardDescription>
        </CardHeader>
        <CardContent>
          {topSpecies.map((species, i) => (
            <View
              key={i}
              style={[
                styles.speciesItem,
                i !== topSpecies.length - 1 && styles.speciesItemBorder,
              ]}
            >
              <View style={styles.speciesLeft}>
                <View style={styles.speciesRank}>
                  <Text style={styles.speciesRankText}>{i + 1}</Text>
                </View>
                <Text style={styles.speciesName}>{species.name}</Text>
              </View>
              <View style={styles.speciesRight}>
                <Text style={styles.speciesCount}>{species.count}</Text>
                <Badge variant="outline" style={styles.trendBadge}>
                  {species.trend}
                </Badge>
              </View>
            </View>
          ))}
        </CardContent>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  mapCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  mapHeader: {
    paddingBottom: spacing.sm + 4,
  },
  mapHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 18,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    paddingTop: spacing.lg,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
  },
  speciesItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  speciesItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  speciesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    flex: 1,
  },
  speciesRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesRankText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  speciesName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  speciesRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  speciesCount: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  trendBadge: {
    borderColor: colors.success,
  },
});

export default MapViewScreen;
