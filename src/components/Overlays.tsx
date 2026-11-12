import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../constants/theme';
import type { IconComponent } from './RoundIconButton';
import SecondaryButton from './SecondaryButton';
import PrimaryButton from './PrimaryButton';

/* ------------------------------------------------------------------ Toast */

interface ToastProps {
  text: string | null;
}

function ToastBase({ text }: ToastProps) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: text ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [fade, text]);

  if (!text) {
    return null;
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { opacity: fade }]}>
      <Text style={styles.toastText} numberOfLines={2}>
        {text}
      </Text>
    </Animated.View>
  );
}

export const Toast = memo(ToastBase);

/* --------------------------------------------------------- ConfirmOverlay */

interface ConfirmProps {
  visible: boolean;
  title: string;
  caption?: string;
  confirmLabel: string;
  cancelLabel?: string;
  extraLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onExtra?: () => void;
  danger?: boolean;
}

function ConfirmOverlayBase({
  visible,
  title,
  caption,
  confirmLabel,
  cancelLabel = 'CANCEL',
  extraLabel,
  onConfirm,
  onCancel,
  onExtra,
  danger = false,
}: ConfirmProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlayRoot}>
      <LinearGradient
        colors={['rgba(5,5,16,0.86)', 'rgba(5,5,16,0.94)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.dialog}>
        <Text style={styles.dialogTitle}>{title}</Text>
        {caption ? <Text style={styles.dialogCaption}>{caption}</Text> : null}
        <View style={styles.dialogActions}>
          <PrimaryButton
            label={confirmLabel}
            onPress={onConfirm}
            tone={danger ? 'violet' : 'primary'}
            height={56}
          />
          {extraLabel && onExtra ? (
            <SecondaryButton label={extraLabel} onPress={onExtra} />
          ) : null}
          <SecondaryButton label={cancelLabel} onPress={onCancel} />
        </View>
      </View>
    </View>
  );
}

export const ConfirmOverlay = memo(ConfirmOverlayBase);

/* -------------------------------------------------------------- HintBanner */

interface HintProps {
  text: string;
  visible: boolean;
}

function HintBannerBase({ text, visible }: HintProps) {
  if (!visible) {
    return null;
  }
  return (
    <View style={styles.hint}>
      <Text style={styles.hintText}>{text}</Text>
    </View>
  );
}

export const HintBanner = memo(HintBannerBase);

/* --------------------------------------------------------------- EmptyState */

interface EmptyProps {
  Icon: IconComponent;
  title: string;
  caption: string;
}

function EmptyStateBase({ Icon, title, caption }: EmptyProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon size={40} color={theme.colors.locked} strokeWidth={1.8} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyCaption}>{caption}</Text>
    </View>
  );
}

export const EmptyState = memo(EmptyStateBase);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 110,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.radius.row,
    borderWidth: 1,
    borderColor: theme.colors.borderAccent,
    backgroundColor: 'rgba(16,16,58,0.94)',
    alignItems: 'center',
  },
  toastText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.textSoft,
    textAlign: 'center',
  },

  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    zIndex: 40,
  },
  dialog: {
    width: '100%',
    borderRadius: theme.radius.big,
    borderWidth: 1,
    borderColor: theme.colors.borderAccent,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  dialogCaption: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  dialogActions: { marginTop: 20, gap: 10 },

  hint: {
    alignSelf: 'center',
    maxWidth: '96%',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderAccent,
    backgroundColor: 'rgba(16,16,58,0.80)',
  },
  hintText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.1,
    color: theme.colors.textSoft,
    textAlign: 'center',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(16,16,58,0.5)',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  emptyCaption: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
