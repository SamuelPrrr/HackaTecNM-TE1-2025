import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius } from '../theme/colors';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  style,
  textStyle 
}) => {
  const containerStyle = [
    styles.badge,
    variant === 'default' && styles.badgeDefault,
    variant === 'secondary' && styles.badgeSecondary,
    variant === 'destructive' && styles.badgeDestructive,
    variant === 'outline' && styles.badgeOutline,
    variant === 'success' && styles.badgeSuccess,
    style,
  ];

  const textStyleCombined = [
    styles.badgeText,
    variant === 'default' && styles.badgeTextDefault,
    variant === 'secondary' && styles.badgeTextSecondary,
    variant === 'destructive' && styles.badgeTextDestructive,
    variant === 'outline' && styles.badgeTextOutline,
    variant === 'success' && styles.badgeTextSuccess,
    textStyle,
  ];

  return (
    <View style={containerStyle}>
      <Text style={textStyleCombined}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeDefault: {
    backgroundColor: colors.primary,
    borderColor: 'transparent',
  },
  badgeTextDefault: {
    color: colors.primaryForeground,
  },
  badgeSecondary: {
    backgroundColor: colors.secondary,
    borderColor: 'transparent',
  },
  badgeTextSecondary: {
    color: colors.secondaryForeground,
  },
  badgeDestructive: {
    backgroundColor: colors.destructive,
    borderColor: 'transparent',
  },
  badgeTextDestructive: {
    color: colors.destructiveForeground,
  },
  badgeOutline: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  badgeTextOutline: {
    color: colors.foreground,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
    borderColor: 'transparent',
  },
  badgeTextSuccess: {
    color: colors.successForeground,
  },
});
