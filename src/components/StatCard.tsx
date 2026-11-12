import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import type { IconComponent } from './RoundIconButton';

/** A pill with nothing to show renders nothing at all — never an empty box. */
export function isEmptyValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === 0 ||
    value === '0' ||
    value === ''
  );
}

interface Props {
  value: string | number;
  label: string;
  accent: string;
  Icon: IconComponent;
}

/**
 * One pill shape for the whole app. Every card in a row uses the SAME icon
 * component and differs only by accent colour, value and label, so the row
 * stays visually uniform. A zero/empty value renders nothing at all.
 */
function StatCardBase({ value, label, accent, Icon }: Props) {
  if (isEmptyValue(value)) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
        <Icon size={28} color={accent} strokeWidth={2} />
      </View>
      <Text style={[styles.value, { color: accent }]} numberOfLines={1}>
        {String(value)}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // width:'100%' (never flex:1) so the card keeps its intrinsic height inside
  // a flex:1 parent slot.
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export const StatCard = memo(StatCardBase);

interface RowProps {
  children: React.ReactNode;
}

/** Renders the row only when at least two cards survived their empty check. */
export function StatRow({ children }: RowProps) {
  const visible = React.Children.toArray(children).filter(child => {
    if (!React.isValidElement(child)) {
      return false;
    }
    const props = child.props as Partial<Props>;
    return !isEmptyValue(props.value);
  });

  if (visible.length < 2) {
    return null;
  }

  return (
    <View style={rowStyles.row}>
      {visible.map((child, i) => (
        <View style={rowStyles.slot} key={'stat-' + i}>
          {child}
        </View>
      ))}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  slot: { flex: 1 },
});

export default StatCard;
