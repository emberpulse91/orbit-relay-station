/**
 * OrbitRelayStation — screen state machine only. No navigation library:
 * one union owns the current screen and every screen gets callbacks.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SCREEN_FADE_MS, TOTAL_SECTORS } from './src/constants/config';
import theme from './src/constants/theme';
import type { RoundStats } from './src/game/types';
import { applyRound, nextSector, sectorsCleared } from './src/state/progressStore';
import { bootProgress, updateProgress, useProgress } from './src/hooks/useProgress';
import { bootSettings } from './src/hooks/useSettings';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen from './src/screens/ResultScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export type Screen =
  | 'loader'
  | 'menu'
  | 'levels'
  | 'game'
  | 'result'
  | 'gameover'
  | 'collection'
  | 'progress'
  | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loader');
  const [level, setLevel] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [stats, setStats] = useState<RoundStats | null>(null);

  const progress = useProgress();
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    bootProgress();
    bootSettings();
  }, []);

  const go = useCallback(
    (next: Screen) => {
      setScreen(next);
      fade.setValue(0);
      Animated.timing(fade, {
        toValue: 1,
        duration: SCREEN_FADE_MS,
        useNativeDriver: true,
      }).start();
    },
    [fade],
  );

  // System Back walks one step up; Back on Menu closes the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'menu' || screen === 'loader') {
        return false;
      }
      if (screen === 'game' || screen === 'result' || screen === 'gameover') {
        go('menu');
        return true;
      }
      go('menu');
      return true;
    });
    return () => sub.remove();
  }, [screen, go]);

  const startLevel = useCallback(
    (nextLevel: number) => {
      setLevel(nextLevel);
      setAttempt(a => a + 1);
      setStats(null);
      go('game');
    },
    [go],
  );

  const handlePlay = useCallback(() => {
    startLevel(nextSector(progressRef.current));
  }, [startLevel]);

  const handleGameOver = useCallback(
    (result: RoundStats) => {
      setStats(result);
      updateProgress(applyRound(progressRef.current, result));
      go('result');
    },
    [go],
  );

  const handlePlayAgain = useCallback(() => {
    startLevel(stats ? stats.level : level);
  }, [startLevel, stats, level]);

  const handleNextSector = useCallback(() => {
    if (!stats) {
      go('levels');
      return;
    }
    const candidate = stats.level + 1;
    if (candidate < TOTAL_SECTORS) {
      startLevel(candidate);
    } else {
      go('levels');
    }
  }, [stats, startLevel, go]);

  const goMenu = useCallback(() => go('menu'), [go]);
  const goLevels = useCallback(() => go('levels'), [go]);
  const goCollection = useCallback(() => go('collection'), [go]);
  const goProgress = useCallback(() => go('progress'), [go]);
  const goSettings = useCallback(() => go('settings'), [go]);
  const handleLoaderDone = useCallback(() => go('menu'), [go]);

  let content: React.ReactNode = null;
  if (screen === 'loader') {
    content = <LoaderScreen onDone={handleLoaderDone} />;
  } else if (screen === 'menu') {
    content = (
      <MenuScreen
        onPlay={handlePlay}
        onOpenLevels={goLevels}
        onOpenCollection={goCollection}
        onOpenProgress={goProgress}
        onOpenSettings={goSettings}
      />
    );
  } else if (screen === 'levels') {
    content = <LevelSelectScreen onBack={goMenu} onStart={startLevel} />;
  } else if (screen === 'game') {
    content = (
      <GameScreen
        key={'sector-' + level + '-' + attempt}
        level={level}
        attempt={attempt}
        sectorsCleared={sectorsCleared(progress)}
        defaultModule={progress.defaultModule}
        onGameOver={handleGameOver}
        onLeave={goMenu}
      />
    );
  } else if ((screen === 'result' || screen === 'gameover') && stats) {
    content = (
      <ResultScreen
        stats={stats}
        onPlayAgain={handlePlayAgain}
        onNextSector={handleNextSector}
        onMenu={goMenu}
        onOpenProgress={goProgress}
        onOpenCollection={goCollection}
      />
    );
  } else if (screen === 'collection') {
    content = <CollectionScreen onBack={goMenu} />;
  } else if (screen === 'progress') {
    content = <ProgressScreen onBack={goMenu} />;
  } else if (screen === 'settings') {
    content = <SettingsScreen onBack={goMenu} />;
  } else {
    content = (
      <MenuScreen
        onPlay={handlePlay}
        onOpenLevels={goLevels}
        onOpenCollection={goCollection}
        onOpenProgress={goProgress}
        onOpenSettings={goSettings}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      {/* box-none so the fading wrapper can never swallow a press. */}
      <Animated.View
        pointerEvents="box-none"
        style={[styles.layer, { opacity: fade }]}
      >
        {content}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  layer: { flex: 1 },
});
