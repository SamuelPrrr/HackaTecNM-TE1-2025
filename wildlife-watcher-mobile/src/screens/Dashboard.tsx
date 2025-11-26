import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Wifi, WifiOff, Activity, TrendingUp } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { colors, spacing, borderRadius } from '../theme/colors';

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);

  const recentDetections = [
    { species: 'Red Fox', time: '2 min ago', type: 'Camera', confidence: '98%' },
    { species: 'Barn Owl', time: '15 min ago', type: 'Audio', confidence: '94%' },
    { species: 'European Badger', time: '1 hour ago', type: 'Camera', confidence: '96%' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>EcoMonitor</Text>
        <Text style={styles.subtitle}>Ecological Data Collection & Analysis</Text>
      </View>

      {/* Connection Status Card */}
      <Card style={styles.card}>
        <CardHeader>
          <View style={styles.cardTitleContainer}>
            <View style={styles.iconTitleRow}>
              {isConnected ? (
                <Wifi size={20} color={colors.success} />
              ) : (
                <WifiOff size={20} color={colors.mutedForeground} />
              )}
              <Text style={styles.cardTitleText}>Raspberry Pi Connection</Text>
            </View>
            <Badge variant={isConnected ? 'success' : 'secondary'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </View>
        </CardHeader>
        <CardContent>
          <Text style={styles.description}>
            {isConnected
              ? 'Receiving data from sensors and cameras in real-time'
              : 'Connect to your Raspberry Pi via local Wi-Fi or hotspot'}
          </Text>
          {isConnected && (
            <View style={styles.activeMonitoring}>
              <Activity size={16} color={colors.primary} />
              <Text style={styles.activeText}>Active monitoring</Text>
            </View>
          )}
          <Button
            onPress={() => setIsConnected(!isConnected)}
            variant={isConnected ? 'outline' : 'default'}
            style={styles.button}
          >
            {isConnected ? 'Disconnect' : 'Connect to Device'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <CardContent style={styles.statContent}>
            <Text style={styles.statLabel}>Species Detected</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>24</Text>
            <View style={styles.statTrend}>
              <TrendingUp size={12} color={colors.success} />
              <Text style={styles.trendText}>+3 today</Text>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.statCard}>
          <CardContent style={styles.statContent}>
            <Text style={styles.statLabel}>Active Sensors</Text>
            <Text style={[styles.statValue, { color: colors.secondary }]}>8</Text>
            <View style={styles.statTrend}>
              <Activity size={12} color={colors.mutedForeground} />
              <Text style={[styles.trendText, { color: colors.mutedForeground }]}>
                All operational
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Recent Activity */}
      <Card style={styles.card}>
        <CardHeader>
          <CardTitle style={styles.sectionTitle}>Recent Detections</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDetections.map((detection, i) => (
            <View
              key={i}
              style={[
                styles.detectionItem,
                i !== recentDetections.length - 1 && styles.detectionItemBorder,
              ]}
            >
              <View>
                <Text style={styles.detectionSpecies}>{detection.species}</Text>
                <Text style={styles.detectionMeta}>
                  {detection.type} • {detection.time}
                </Text>
              </View>
              <Badge variant="outline">{detection.confidence}</Badge>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  description: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
  },
  activeMonitoring: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  activeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  button: {
    marginTop: spacing.md,
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
  statLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: colors.success,
  },
  sectionTitle: {
    fontSize: 18,
  },
  detectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detectionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detectionSpecies: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 4,
  },
  detectionMeta: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
});

export default Dashboard;
