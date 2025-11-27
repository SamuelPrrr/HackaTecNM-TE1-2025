import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Database, Cloud, Calendar, Filter, Search, Upload, Plus, X } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { colors, spacing } from '../theme/colors';
import localStorageService, { WildlifeRecord } from '../../services/localStorageService';
import syncService from '../../services/syncService';
import config from '../../services/config';

const Data = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [records, setRecords] = useState<WildlifeRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, unsynced: 0 });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    cantidad_especies: '',
    tipo_especies: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().split(' ')[0].slice(0, 5),
    lat: '',
    long: '',
  });

  // Load records on mount
  useEffect(() => {
    loadRecords();
    // Sync service config from environment variables
    // Endpoint: http://3.16.128.82:8000/dw/
    syncService.setConfig({
      baseURL: config.api.baseURL,
      endpoint: config.api.endpoint,
      timeout: config.api.timeout,
    });
    console.log('📡 Sync configured:', {
      baseURL: config.api.baseURL,
      endpoint: config.api.endpoint,
      fullURL: `${config.api.baseURL}${config.api.endpoint}`,
    });
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await localStorageService.getAllRecords();
      const stats = await localStorageService.getStorageStats();
      setRecords(data);
      setStats(stats);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async () => {
    if (!formData.cantidad_especies || !formData.tipo_especies || !formData.fecha || !formData.hora) {
      Alert.alert('Error de validación', 'Por favor llena todos los campos requeridos');
      return;
    }

    // Validate numeric fields: cantidad_especies, lat, long
    const cantidad = Number(formData.cantidad_especies);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      Alert.alert('Error de validación', 'Cantidad de especies debe ser un número entero mayor que 0');
      return;
    }

    if (formData.lat) {
      const latNum = parseFloat(formData.lat);
      if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
        Alert.alert('Error de validación', 'La latitud debe ser un número entre -90 y 90');
        return;
      }
    }

    if (formData.long) {
      const longNum = parseFloat(formData.long);
      if (!Number.isFinite(longNum) || longNum < -180 || longNum > 180) {
        Alert.alert('Error de validación', 'La longitud debe ser un número entre -180 y 180');
        return;
      }
    }

    try {
      const newRecord: WildlifeRecord = {
        cantidad_especies: Math.floor(Number(formData.cantidad_especies)),
        tipo_especies: formData.tipo_especies,
        fecha: formData.fecha,
        hora: formData.hora,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        long: formData.long ? parseFloat(formData.long) : undefined,
      };

      await localStorageService.saveRecord(newRecord);
      Alert.alert('Éxito', 'Registro guardado localmente');
      setFormData({
        cantidad_especies: '',
        tipo_especies: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().split(' ')[0].slice(0, 5),
        lat: '',
        long: '',
      });
      setShowForm(false);
      loadRecords();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro');
      console.error('Error saving record:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const unsyncedRecords = await localStorageService.getUnsyncedRecords();
      if (unsyncedRecords.length === 0) {
        Alert.alert('Información', 'No hay registros para sincronizar');
        setSyncing(false);
        return;
      }

      const result = await syncService.uploadRecords(unsyncedRecords);
      if (result.success && result.uploadedIds.length > 0) {
        await localStorageService.markRecordsSynced(result.uploadedIds);
        Alert.alert('Éxito', `Se sincronizaron ${result.uploadedIds.length} registros`);
        setLastSync(new Date());
        loadRecords();
      } else {
        Alert.alert('Error', result.errors?.[0] || 'Error al sincronizar los registros');
      }
    } catch (error) {
      Alert.alert('Error', 'Falló la sincronización');
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    setSyncing(true);
    try {
      const isConnected = await syncService.checkConnectivity();
      if (isConnected) {
        Alert.alert('✅ Conectado', 'El servidor es accesible');
      } else {
        Alert.alert('❌ Error de conexión', 'No se puede acceder al servidor. Verifica la URL en el archivo .env');
      }
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestEndpoint = async () => {
    setSyncing(true);
    try {
      await syncService.testEndpoint();
      Alert.alert('✅ Prueba completada', 'Revisa los logs de la consola para más detalles');
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteRecord = async (recordId: string | undefined) => {
    if (!recordId) return;
    try {
      await localStorageService.deleteRecord(recordId);
      loadRecords();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el registro');
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.tipo_especies.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fecha.includes(searchQuery)
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Almacén de datos</Text>
        <Text style={styles.subtitle}>Administra y sincroniza tus datos recolectados</Text>
      </View>

      {/* Sync Status */}
      <Card style={styles.syncCard}>
        <CardHeader>
          <View style={styles.syncTitleRow}>
            <Cloud
              size={20}
              color={colors.primary}
            />
            <CardTitle style={styles.syncTitle}>
              Sincronización en la nube
            </CardTitle>
          </View>
          <CardDescription>
            {lastSync
              ? `Última sincronización: ${lastSync.toLocaleString()}`
              : 'Sin sincronizaciones recientes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.pendingContainer}>
            <View style={styles.pendingInfo}>
              <Text style={styles.pendingLabel}>Registros pendientes</Text>
              <Text style={styles.pendingValue}>{stats.unsynced}</Text>
            </View>
            {syncing ? (
              <ActivityIndicator
                size='small'
                color={colors.primary}
              />
            ) : (
              <Upload
                size={32}
                color={colors.mutedForeground}
              />
            )}
          </View>
          <View style={styles.buttonRow}>
            <Button
              onPress={handleSync}
              style={{ ...styles.syncButton, ...styles.syncButtonFull } as any}
              disabled={syncing}
            >
              <View style={styles.buttonContent}>
                <Cloud
                  size={16}
                  color={colors.primaryForeground}
                />
                <Text style={styles.buttonText}>
                  {syncing ? 'Sincronizando...' : 'Sincronizar con el almacén'}
                </Text>
              </View>
            </Button>
          </View>
          <View style={styles.testButtonRow}>
            {/* <TouchableOpacity 
              onPress={handleTestConnection} 
              style={styles.testButton}
              disabled={syncing}
            >
              <Text style={styles.testButtonText}>Test Health 🔌</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleTestEndpoint} 
              style={styles.testButton}
              disabled={syncing}
            >
              <Text style={styles.testButtonText}>Test /dw/ 📤</Text>
            </TouchableOpacity> */}
          </View>
        </CardContent>
      </Card>

      {/* Add Record Form Modal */}
      <Modal
        visible={showForm}
        animationType='slide'
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo registro de vida silvestre</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X
                  size={24}
                  color={colors.foreground}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tipo de especie *</Text>
                <Input
                  placeholder='ej. Zorro rojo'
                  value={formData.tipo_especies}
                  onChangeText={(text) =>
                    setFormData({ ...formData, tipo_especies: text })
                  }
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cantidad *</Text>
                <Input
                  placeholder='0'
                  value={formData.cantidad_especies}
                  onChangeText={(text) =>
                    setFormData({ ...formData, cantidad_especies: text })
                  }
                  keyboardType='numeric'
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>Fecha *</Text>
                  <Input
                    placeholder='AAAA-MM-DD'
                    value={formData.fecha}
                    onChangeText={(text) =>
                      setFormData({ ...formData, fecha: text })
                    }
                    style={styles.formInput}
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>Hora *</Text>
                  <Input
                    placeholder='HH:mm'
                    value={formData.hora}
                    onChangeText={(text) =>
                      setFormData({ ...formData, hora: text })
                    }
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>Latitud</Text>
                  <Input
                    placeholder='0.0000000'
                    value={formData.lat}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lat: text })
                    }
                    keyboardType='decimal-pad'
                    style={styles.formInput}
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>Longitud</Text>
                  <Input
                    placeholder='0.0000000'
                    value={formData.long}
                    onChangeText={(text) =>
                      setFormData({ ...formData, long: text })
                    }
                    keyboardType='decimal-pad'
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.formActions}>
                <Button
                  onPress={() => setShowForm(false)}
                  style={
                    {
                      ...styles.formButton,
                      ...styles.formButtonCancel,
                    } as any
                  }
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Cancelar
                  </Text>
                </Button>
                <Button
                  onPress={handleAddRecord}
                  style={
                    {
                      ...styles.formButton,
                      ...styles.formButtonSubmit,
                    } as any
                  }
                >
                  <Text style={styles.buttonText}>Guardar registro</Text>
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Filters and Search */}
      <Card style={styles.card}>
        <CardHeader>
          <CardTitle style={styles.sectionTitle}>Registros de datos</CardTitle>
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
                placeholder='Buscar registros...'
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Filter
                size={20}
                color={colors.foreground}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size='small'
              color={colors.primary}
              style={styles.loadingSpinner}
            />
          ) : filteredRecords.length > 0 ? (
            <View style={styles.recordsList}>
              {filteredRecords.map((record) => (
                <Card
                  key={record.id}
                  style={styles.recordCard}
                >
                  <CardContent style={styles.recordContent}>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordSpecies}>
                        {record.tipo_especies}
                      </Text>
                      <View style={styles.recordMeta}>
                        <Calendar
                          size={12}
                          color={colors.mutedForeground}
                        />
                        <Text style={styles.recordMetaText}>
                          {record.fecha}
                        </Text>
                        <Text style={styles.recordMetaText}>•</Text>
                        <Text style={styles.recordMetaText}>{record.hora}</Text>
                      </View>
                      <Text style={styles.recordQuantity}>
                        Cant.: {record.cantidad_especies}
                      </Text>
                      {record.lat && record.long && (
                        <Text style={styles.recordLocation}>
                          📍 {record.lat.toFixed(4)}, {record.long.toFixed(4)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.recordActions}>
                      <Badge variant={record.synced ? 'default' : 'outline'}>
                        {record.synced ? 'Sincronizado' : 'Pendiente'}
                      </Badge>
                      <TouchableOpacity
                        onPress={() => handleDeleteRecord(record.id)}
                        style={styles.deleteButton}
                      >
                        <X
                          size={16}
                          color={colors.foreground}
                        />
                      </TouchableOpacity>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          ) : (
            <Text style={styles.noRecords}>No se encontraron registros</Text>
          )}
        </CardContent>
      </Card>

      {/* Add Record Button */}
      <View style={styles.addButtonContainer}>
        <Button
          onPress={() => setShowForm(true)}
          style={styles.addButton}
        >
          <View style={styles.buttonContent}>
            <Plus
              size={16}
              color={colors.primaryForeground}
            />
            <Text style={styles.buttonText}>Agregar nuevo registro</Text>
          </View>
        </Button>
      </View>

      {/* Storage Info */}
      <Card style={styles.storageCard}>
        <CardHeader>
          <View style={styles.storageTitleRow}>
            <Database
              size={20}
              color={colors.foreground}
            />
            <CardTitle style={styles.storageTitle}>Información de almacenamiento</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.storageInfo}>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Registros totales</Text>
              <Text style={styles.storageValue}>{stats.total}</Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Pendientes por sincronizar</Text>
              <Text style={styles.storageValue}>{stats.unsynced}</Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Sincronizados</Text>
              <Text style={styles.storageValue}>
                {stats.total - stats.unsynced}
              </Text>
            </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  syncButtonFull: {
    flex: 1,
  },
  testButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  testButton: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.muted,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
  },
  addButtonContainer: {
    marginBottom: spacing.md,
  },
  addButton: {
    backgroundColor: colors.primary,
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
  loadingSpinner: {
    marginVertical: spacing.md,
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
    alignItems: 'flex-start',
    paddingTop: spacing.md,
    gap: spacing.sm,
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
  recordQuantity: {
    fontSize: 12,
    color: colors.foreground,
    fontWeight: '500',
  },
  recordLocation: {
    fontSize: 11,
    color: colors.primary,
  },
  recordActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  deleteButton: {
    padding: spacing.xs,
  },
  noRecords: {
    textAlign: 'center',
    color: colors.mutedForeground,
    paddingVertical: spacing.lg,
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
  // Modal and Form styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  formScroll: {
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  formGroupHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.foreground,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  formButton: {
    flex: 1,
  },
  formButtonCancel: {
    backgroundColor: colors.muted,
  },
  formButtonSubmit: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.foreground,
  },
});

export default Data;
