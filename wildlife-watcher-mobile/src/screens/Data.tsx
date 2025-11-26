import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Database, Cloud, Calendar, Filter, Search, Upload } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { colors, spacing } from '../theme/colors';

const Data = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = () => {
    setLastSync(new Date());
  };

  const records = [
    { id: 1, species: 'Red Fox', date: '2024-01-20', type: 'Camera', location: 'Zone A' },
    { id: 2, species: 'Barn Owl', date: '2024-01-20', type: 'Audio', location: 'Zone B' },
    { id: 3, species: 'European Badger', date: '2024-01-19', type: 'Camera', location: 'Zone A' },
    { id: 4, species: 'Roe Deer', date: '2024-01-19', type: 'Camera', location: 'Zone C' },
    { id: 5, species: 'Red Fox', date: '2024-01-18', type: 'Motion', location: 'Zone A' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Data Warehouse</Text>
        <Text style={styles.subtitle}>Manage and sync your collected data</Text>
      </View>

      {/* Sync Status */}
      <Card style={styles.syncCard}>
        <CardHeader>
          <View style={styles.syncTitleRow}>
            <Cloud size={20} color={colors.primary} />
            <CardTitle style={styles.syncTitle}>Cloud Synchronization</CardTitle>
          </View>
          <CardDescription>
            {lastSync
              ? `Last synced: ${lastSync.toLocaleString()}`
              : 'No recent synchronization'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.pendingContainer}>
            <View style={styles.pendingInfo}>
              <Text style={styles.pendingLabel}>Pending Records</Text>
              <Text style={styles.pendingValue}>247</Text>
            </View>
            <Upload size={32} color={colors.mutedForeground} />
          </View>
          <Button onPress={handleSync} style={styles.syncButton}>
            <View style={styles.buttonContent}>
              <Cloud size={16} color={colors.primaryForeground} />
              <Text style={styles.buttonText}>Sync to Warehouse</Text>
            </View>
          </Button>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card style={styles.card}>
        <CardHeader>
          <CardTitle style={styles.sectionTitle}>Data Records</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Search
                size={16}
                color={colors.mutedForeground}
                style={styles.searchIcon}
              />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={styles.recordsList}>
            {records.map((record) => (
              <Card key={record.id} style={styles.recordCard}>
                <CardContent style={styles.recordContent}>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordSpecies}>{record.species}</Text>
                    <View style={styles.recordMeta}>
                      <Calendar size={12} color={colors.mutedForeground} />
                      <Text style={styles.recordMetaText}>{record.date}</Text>
                      <Text style={styles.recordMetaText}>•</Text>
                      <Text style={styles.recordMetaText}>{record.location}</Text>
                    </View>
                  </View>
                  <Badge variant="outline">{record.type}</Badge>
                </CardContent>
              </Card>
            ))}
          </View>
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card style={styles.storageCard}>
        <CardHeader>
          <View style={styles.storageTitleRow}>
            <Database size={20} color={colors.foreground} />
            <CardTitle style={styles.storageTitle}>Storage Usage</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.storageInfo}>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Local Storage</Text>
              <Text style={styles.storageValue}>2.4 GB / 5 GB</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.storageNote}>
              Sync data to free up local storage space
            </Text>
          </View>
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
  syncCard: {
    marginBottom: spacing.md,
    borderWidth: 2,
  },
  syncTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  syncTitle: {
    fontSize: 20,
  },
  pendingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.muted + '80',
    padding: spacing.sm + 4,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  pendingInfo: {
    gap: spacing.xs,
  },
  pendingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  pendingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  syncButton: {
    marginTop: spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.sm + 4,
    top: spacing.sm + 4,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: spacing.xl + 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  recordsList: {
    gap: spacing.sm,
  },
  recordCard: {
    backgroundColor: colors.card,
  },
  recordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  recordInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  recordSpecies: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordMetaText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  storageCard: {
    backgroundColor: colors.muted + '80',
  },
  storageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  storageTitle: {
    fontSize: 18,
  },
  storageInfo: {
    gap: spacing.sm + 4,
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storageLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '48%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  storageNote: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
});

export default Data;
