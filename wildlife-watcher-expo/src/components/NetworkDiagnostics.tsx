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
      log('🔧 Network Diagnostics Started');
      log('================================');

      // 1. Config check
      log(`\n📋 Configuration:`);
      log(`   Base URL: ${config.api.baseURL}`);
      log(`   Endpoint: ${config.api.endpoint}`);
      log(`   Full URL: ${config.api.baseURL}${config.api.endpoint}`);

      // 2. Try health endpoint
      log(`\n🏥 Testing /health endpoint:`);
      try {
        const healthResponse = await Promise.race([
          fetch(`${config.api.baseURL}/health`),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout 5s')), 5000)
          ),
        ]);
        log(`   ✅ Status: ${(healthResponse as any).status}`);
      } catch (error: any) {
        log(`   ❌ Failed: ${error.message}`);
      }

      // 3. Try API endpoint with OPTIONS
      log(`\n📤 Testing ${config.api.endpoint} with OPTIONS:`);
      try {
        const optionsResponse = await Promise.race([
          fetch(`${config.api.baseURL}${config.api.endpoint}`, {
            method: 'OPTIONS',
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout 5s')), 5000)
          ),
        ]);
        log(`   ✅ Status: ${(optionsResponse as any).status}`);
        log(`   Headers: ${JSON.stringify(Object.fromEntries((optionsResponse as any).headers))}`);
      } catch (error: any) {
        log(`   ℹ️  OPTIONS not supported: ${error.message}`);
      }

      // 4. Try simple GET
      log(`\n🔍 Testing GET request:`);
      try {
        const getResponse = await Promise.race([
          fetch(`${config.api.baseURL}${config.api.endpoint}`, {
            method: 'GET',
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout 5s')), 5000)
          ),
        ]);
        log(`   ✅ Status: ${(getResponse as any).status}`);
      } catch (error: any) {
        log(`   ℹ️  GET not supported: ${error.message}`);
      }

      // 5. Try POST with minimal data
      log(`\n📮 Testing POST with minimal payload:`);
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
        log(`   ✅ Status: ${(postResponse as any).status}`);
        log(`   Response: ${postText.substring(0, 100)}`);
      } catch (error: any) {
        log(`   ❌ POST Failed: ${error.message}`);
      }

      log(`\n✅ Diagnostics Complete!`);
      log(`\n💡 Next steps:`);
      log(`   1. Check if server is running`);
      log(`   2. Verify URL can be reached from device`);
      log(`   3. Check server logs for incoming requests`);
    } catch (error: any) {
      log(`❌ Error during diagnostics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔌 Network Diagnostics</Text>
        <Text style={styles.subtitle}>Test server connectivity</Text>
      </View>

      <TouchableOpacity
        style={[styles.runButton, loading && styles.runButtonDisabled]}
        onPress={runDiagnostics}
        disabled={loading}
      >
        <Text style={styles.runButtonText}>{loading ? 'Testing...' : 'Run Diagnostics'}</Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>💡 Troubleshooting:</Text>
        <Text style={styles.infoText}>
          If you see "Network request failed":{'\n'}
          • iOS Simulator: Use http://localhost:8000{'\n'}
          • Android Emulator: Use http://10.0.2.2:8000{'\n'}
          • Physical Device: Use device IP or http://3.16.128.82:8000{'\n'}
          {'\n'}
          Edit .env file and restart the app!
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
