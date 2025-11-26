import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  style,
  textStyle,
}) => {
  const containerStyle = [
    styles.button,
    variant === 'default' && styles.buttonDefault,
    variant === 'outline' && styles.buttonOutline,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'ghost' && styles.buttonGhost,
    variant === 'destructive' && styles.buttonDestructive,
    size === 'default' && styles.buttonSizeDefault,
    size === 'sm' && styles.buttonSizeSm,
    size === 'lg' && styles.buttonSizeLg,
    size === 'icon' && styles.buttonSizeIcon,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyleCombined = [
    styles.buttonText,
    variant === 'default' && styles.buttonTextDefault,
    variant === 'outline' && styles.buttonTextOutline,
    variant === 'secondary' && styles.buttonTextSecondary,
    variant === 'ghost' && styles.buttonTextGhost,
    variant === 'destructive' && styles.buttonTextDestructive,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyleCombined}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Variants
  buttonDefault: {
    backgroundColor: colors.primary,
  },
  buttonTextDefault: {
    color: colors.primaryForeground,
  },
  buttonOutline: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.input,
  },
  buttonTextOutline: {
    color: colors.foreground,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonTextSecondary: {
    color: colors.secondaryForeground,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonTextGhost: {
    color: colors.foreground,
  },
  buttonDestructive: {
    backgroundColor: colors.destructive,
  },
  buttonTextDestructive: {
    color: colors.destructiveForeground,
  },
  // Sizes
  buttonSizeDefault: {
    height: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonSizeSm: {
    height: 36,
    paddingHorizontal: spacing.sm + 4,
  },
  buttonSizeLg: {
    height: 44,
    paddingHorizontal: spacing.xl,
  },
  buttonSizeIcon: {
    height: 40,
    width: 40,
    paddingHorizontal: 0,
  },
  // States
  buttonDisabled: {
    opacity: 0.5,
  },
});
