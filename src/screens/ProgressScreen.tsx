import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity, ArrowLeft, Zap } from 'lucide-react-native';
import { TOTAL_SECTORS, TOTAL_STARS } from '../constants/config';
import theme from '../constants/theme';
import {
  bestScore,
  efficiency,
  sectorsCleared as countCleared,
  totalStars,
} from '../state/progressStore';
import { useProgress } from '../hooks/useProgress';
import RoundIconButton from '../components/RoundIconButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StarfieldBackdrop from '../components/StarfieldBackdrop';
import StatCard, { StatRow } from '../components/StatCard';
import { EmptyState } from '../components/Overlays';

const STREAK_COLORS = [
  theme.colors.gridLine,
  theme.colors.primaryDeep,
  theme.colors.primary,
  theme.colors.beam,
];

interface Props {
  onBack: () => void;
}

export default function ProgressScreen({ onBack }: Props) {
  const progress = useProgress();
  const cleared = countCleared(progress);
  const stars = totalStars(progress);
  const best = bestScore(progress);
  const eff = efficiency(progress);

  const empty = cleared === 0;

  return (
    <StarfieldBackdrop variant="levels">
      <ScreenHeader
        title="STATION LOG"
        subtitle="MISSION HISTORY"
        leftSlot={
          <RoundIconButton
            Icon={ArrowLeft}
            onPress={onBack}
            accessibilityLabel="Back to menu"
          />
        }
      />

      {empty ? (
        <EmptyState
          Icon={Activity}
          title="NO SECTORS LOGGED YET"
          caption="ROUTE YOUR FIRST SECTOR TO START THE LOG"
        />
      ) : (
        <View style={styles.body}>
          <StatRow>
            <StatCard
              value={cleared + '/' + TOTAL_SECTORS}
              label="SECTORS"
              accent={theme.colors.primary}
              Icon={Zap}
            />
            <StatCard
              value={stars + '/' + TOTAL_STARS}
              label="STARS"
              accent={theme.colors.star}
              Icon={Zap}
            />
          </StatRow>

          <View style={styles.spacer} />

          <StatRow>
            <StatCard
              value={best}
              label="BEST SCORE"
              accent={theme.colors.beam}
              Icon={Zap}
            />
            <StatCard
              value={eff ? eff + ' %' : 0}
              label="EFFICIENCY"
              accent={theme.colors.powered}
              Icon={Zap}
            />
          </StatRow>

          <View style={styles.streakCard}>
            <Text style={styles.streakTitle}>MISSION STREAK</Text>
            <View style={styles.streakRow}>
              {progress.stars.map((s, i) => (
                <View
                  key={'cell' + i}
                  style={[
                    styles.streakCell,
                    { backgroundColor: STREAK_COLORS[Math.min(3, s)] },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.streakCaption}>ONE SQUARE PER SECTOR · BRIGHTER = MORE STARS</Text>
          </View>

          <View style={styles.thinRow}>
            <View style={styles.thinCell}>
              <Text style={styles.thinLabel}>TOTAL ENERGY SAVED</Text>
              <Text style={[styles.thinValue, { color: theme.colors.beam }]}>
                {progress.energySaved}
              </Text>
            </View>
            <View style={styles.thinDivider} />
            <View style={styles.thinCell}>
              <Text style={styles.thinLabel}>RELAYS DEPLOYED</Text>
              <Text style={[styles.thinValue, { color: theme.colors.primary }]}>
                {progress.relaysDeployed}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <SecondaryButton label="MENU" onPress={onBack} />
      </View>
    </StarfieldBackdrop>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  spacer: { height: 10 },
  streakCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass,
  },
  streakTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: theme.colors.textSecondary,
  },
  streakRow: { flexDirection: 'row', gap: 5, marginTop: 10 },
  streakCell: { flex: 1, height: 18, borderRadius: 4 },
  streakCaption: {
    marginTop: 10,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: theme.colors.textMuted,
  },
  thinRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(16,16,58,0.45)',
  },
  thinCell: { flex: 1, alignItems: 'center' },
  thinDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.08)' },
  thinLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: theme.colors.textMuted,
  },
  thinValue: {
    marginTop: 4,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  footer: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12 },
});
