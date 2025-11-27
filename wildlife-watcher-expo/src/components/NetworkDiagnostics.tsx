import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing } from '../theme/colors';
import config from '../../services/config';
import syncService from '../../services/syncService';

export default function NetworkDiagnostics() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const log = (message: string) => {
    setResults((prev) => [...prev, message]);
    console.log(message);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setLoading(true);

    try {
      log('🔧 Diagnóstico de red iniciado');
      log('================================');

      // 1. Config check
      log(`\n📋 Configuración:`);
      log(`   Base URL: ${config.api.baseURL}`);
      log(`   Endpoint: ${config.api.endpoint}`);
      log(`   Full URL: ${config.api.baseURL}${config.api.endpoint}`);

      // 2. Try health endpoint
      log(`\n🏥 Probando endpoint /health:`);
      try {
        const healthResponse = await Promise.race([
          fetch(`${config.api.baseURL}/health`),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout 5s')), 5000)
          ),
        ]);
        log(`   ✅ Estado: ${(healthResponse as any).status}`);
      } catch (error: any) {
        log(`   ❌ Falló: ${error.message}`);
      }

      // 3. Try API endpoint with OPTIONS
      log(`\n📤 Probando ${config.api.endpoint} con OPTIONS:`);
      try {
        const optionsResponse = await Promise.race([
          fetch(`${config.api.baseURL}${config.api.endpoint}`, {
            method: 'OPTIONS',
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout 5s')), 5000)
          ),
        ]);
        log(`   ✅ Estado: ${(optionsResponse as any).status}`);
        log(`   Encabezados: ${JSON.stringify(Object.fromEntries((optionsResponse as any).headers))}`);
      } catch (error: any) {
        log(`   ℹ️  OPTIONS no soportado: ${error.message}`);
      }

      // 4. Try simple GET
      log(`\n🔍 Probando solicitud GET:`);
      try {
        const getResponse = await Promise.race([
          fetch(`${config.api.baseURL}${config.api.endpoint}`, {
            method: 'GET',
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout 5s')), 5000)
          ),
        ]);
        log(`   ✅ Estado: ${(getResponse as any).status}`);
      } catch (error: any) {
        log(`   ℹ️  GET no soportado: ${error.message}`);
      }

      // 5. Try POST with minimal data
      log(`\n📮 Probando POST con carga mínima:`);
      try {
        const postResponse = await Promise.race([
          fetch(`${config.api.baseURL}${config.api.endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([]),
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout 5s')), 5000)
          ),
        ]);
        const postText = await (postResponse as any).text();
        log(`   ✅ Estado: ${(postResponse as any).status}`);
        log(`   Respuesta: ${postText.substring(0, 100)}`);
      } catch (error: any) {
        log(`   ❌ POST falló: ${error.message}`);
      }

      log(`\n✅ Diagnóstico completado`);
      log(`\n💡 Siguientes pasos:`);
      log(`   1. Verifica que el servidor esté en ejecución`);
      log(`   2. Comprueba que la URL sea accesible desde el dispositivo`);
      log(`   3. Revisa los logs del servidor para ver si llegan solicitudes`);
    } catch (error: any) {
      log(`❌ Error durante el diagnóstico: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔌 Diagnóstico de red</Text>
        <Text style={styles.subtitle}>Probar conectividad con el servidor</Text>
      </View>

      <TouchableOpacity
        style={[styles.runButton, loading && styles.runButtonDisabled]}
        onPress={runDiagnostics}
        disabled={loading}
      >
        <Text style={styles.runButtonText}>{loading ? 'Probando...' : 'Ejecutar diagnóstico'}</Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>💡 Solución de problemas:</Text>
        <Text style={styles.infoText}>
          Si ves "Network request failed":{'\n'}
          • Simulador iOS: Usa http://localhost:8000{'\n'}
          • Emulador Android: Usa http://10.0.2.2:8000{'\n'}
          • Dispositivo físico: Usa la IP del servidor o http://3.16.128.82:8000{'\n'}
          {'\n'}
          ¡Edita el archivo .env y reinicia la app!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  runButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    color: colors.primaryForeground,
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.muted,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontFamily: 'Courier New',
  },
  resultText: {
    fontSize: 11,
    color: colors.foreground,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  info: {
    backgroundColor: colors.muted,
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  infoTitle: {
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 12,
    color: colors.foreground,
    lineHeight: 18,
  },
});
