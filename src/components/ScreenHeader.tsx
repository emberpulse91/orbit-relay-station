import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HEADER_HEIGHT, HEADER_TOP_PAD } from '../constants/config';
import theme from '../constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  bordered?: boolean;
}

/**
 * The one header of the app. Menu, Level Select, Game, Result, Collection,
 * Progress and Settings all render THIS component and only swap the slots, so
 * padding, type and badge styling can never drift apart between screens.
 */
function ScreenHeaderBase({
  title,
  subtitle,
  leftSlot,
  rightSlot,
  bordered = true,
}: Props) {
  return (
    <View style={[styles.root, bordered ? styles.bordered : null]}>
      <View style={styles.side}>{leftSlot}</View>
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.sideRight}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: HEADER_TOP_PAD,
    height: HEADER_TOP_PAD + HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5,5,16,0.72)',
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(65,105,225,0.22)',
  },
  side: { width: 64, alignItems: 'flex-start', justifyContent: 'center' },
  sideRight: { width: 64, alignItems: 'flex-end', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export const ScreenHeader = memo(ScreenHeaderBase);
export default ScreenHeader;
