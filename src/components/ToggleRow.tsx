import React, { memo, useCallback } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import theme from '../constants/theme';
import type { IconComponent } from './RoundIconButton';

interface Props<K extends string> {
  name: K;
  Icon: IconComponent;
  title: string;
  caption: string;
  value: boolean;
  accent?: string;
  onChange: (name: K, value: boolean) => void;
}

function ToggleRowBase<K extends string>({
  name,
  Icon,
  title,
  caption,
  value,
  accent = theme.colors.beam,
  onChange,
}: Props<K>) {
  const handle = useCallback((next: boolean) => onChange(name, next), [name, onChange]);

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
        <Icon size={20} color={accent} strokeWidth={2.1} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.caption} numberOfLines={2}>
          {caption}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={handle}
        trackColor={{ true: theme.colors.primary, false: theme.colors.gridLine }}
        thumbColor={value ? theme.colors.beam : theme.colors.textMuted}
        accessibilityLabel={title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.row,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.textPrimary,
  },
  caption: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
});

export const ToggleRow = memo(ToggleRowBase) as typeof ToggleRowBase;
export default ToggleRow;
