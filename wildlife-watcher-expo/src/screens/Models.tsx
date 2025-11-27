import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Mic, Camera, Activity, CheckCircle2 } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { colors, spacing } from '../theme/colors';

type ModelType = 'audio' | 'motion' | 'species' | null;

interface Model {
  id: ModelType;
  title: string;
  description: string;
  icon: any;
  features: string[];
}

const Models = () => {
  const [activeModel, setActiveModel] = useState<ModelType>(null);

  const models: Model[] = [
    {
      id: 'audio',
      title: 'Procesamiento de audio',
      description: 'Reconoce llamadas de animales y sonidos ambientales mediante análisis acústico',
      icon: Mic,
      features: ['Identificación de cantos de aves', 'Vocalización de mamíferos', 'Monitoreo de nivel de sonido'],
    },
    {
      id: 'motion',
      title: 'Detección de movimiento',
      description: 'Rastrea movimiento y patrones de actividad en el área monitoreada',
      icon: Activity,
      features: ['Alertas en tiempo real', 'Análisis de patrones', 'Seguimiento de actividad'],
    },
    {
      id: 'species',
      title: 'Reconocimiento de especies',
      description: 'Identificación visual de flora y fauna a través de cámaras',
      icon: Camera,
      features: ['Clasificación de animales', 'Identificación de plantas', 'Conteo de poblaciones'],
    },
  ];

  const handleModelSelect = (modelId: ModelType) => {
    setActiveModel(modelId);
  };

  const activeModelData = models.find((m) => m.id === activeModel);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Modelos de procesamiento</Text>
        <Text style={styles.subtitle}>Selecciona el modelo de IA que se ejecutará en tu Raspberry Pi</Text>
      </View>

      {/* Active Model Banner */}
      {activeModel && activeModelData && (
        <Card style={styles.activeBanner}>
          <CardContent style={styles.activeBannerContent}>
            <CheckCircle2 size={20} color={colors.primary} />
            <View style={styles.activeBannerText}>
              <Text style={styles.activeBannerTitle}>Modelo activo: {activeModelData.title}</Text>
              <Text style={styles.activeBannerSubtitle}>Procesando datos en tiempo real</Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Model Cards */}
      {models.map((model) => {
        const Icon = model.icon;
        const isActive = activeModel === model.id;

        return (
          <Card
            key={model.id}
            style={[styles.modelCard, isActive && styles.modelCardActive]}
          >
            <CardHeader>
              <View style={styles.modelHeader}>
                <View style={styles.modelTitleRow}>
                  <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                    <Icon
                      size={24}
                      color={isActive ? colors.primaryForeground : colors.foreground}
                    />
                  </View>
                  <View style={styles.modelTitleContainer}>
                    <CardTitle style={styles.modelTitle}>{model.title}</CardTitle>
                    <CardDescription style={styles.modelDescription}>
                      {model.description}
                    </CardDescription>
                  </View>
                </View>
                {isActive && <Badge variant="success">Activo</Badge>}
              </View>
            </CardHeader>
            <CardContent>
              <Text style={styles.featuresLabel}>Características:</Text>
              <View style={styles.featuresList}>
                {model.features.map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <View style={styles.featureBullet} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <Button
                onPress={() => handleModelSelect(model.id)}
                variant={isActive ? 'outline' : 'default'}
                style={styles.modelButton}
              >
                {isActive ? 'Desactivar' : 'Activar modelo'}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <CardContent style={styles.infoContent}>
          <Text style={styles.infoText}>
            <Text style={styles.infoTextBold}>Nota:</Text> Solo un modelo puede estar activo a la
            vez. Al seleccionar un nuevo modelo se configurará tu Raspberry Pi para ejecutar ese
            tipo de análisis.
          </Text>
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
  activeBanner: {
    backgroundColor: colors.primary + '0D',
    borderColor: colors.primary,
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  activeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingTop: spacing.lg,
  },
  activeBannerText: {
    flex: 1,
  },
  activeBannerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 4,
  },
  activeBannerSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  modelCard: {
    marginBottom: spacing.md,
  },
  modelCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modelTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 4,
    flex: 1,
  },
  iconContainer: {
    backgroundColor: colors.muted,
    padding: spacing.sm + 4,
    borderRadius: 12,
  },
  iconContainerActive: {
    backgroundColor: colors.primary,
  },
  modelTitleContainer: {
    flex: 1,
  },
  modelTitle: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  modelDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  featuresLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  featuresList: {
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  featureText: {
    fontSize: 14,
    color: colors.foreground,
  },
  modelButton: {
    marginTop: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.muted + '80',
  },
  infoContent: {
    paddingTop: spacing.lg,
  },
  infoText: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  infoTextBold: {
    fontWeight: '700',
    color: colors.foreground,
  },
});

export default Models;
