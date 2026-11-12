import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import {
  BOARD_FRAME,
  BOARD_H,
  BOARD_W,
  CELL,
  REACTOR_RANGE,
  SPRING_UI,
} from '../constants/config';
import theme from '../constants/theme';
import type { Asteroid, Point, Relay, RouteResult } from '../game/types';
import BeamLayer from './BeamLayer';
import BoardCell, { type CellKind } from './BoardCell';

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

interface Props {
  cols: number;
  rows: number;
  reactor: Point;
  domes: Point[];
  asteroids: Asteroid[];
  relays: Relay[];
  routing: RouteResult;
  selectedRelayId: string | null;
  rejectedCell: string | null;
  driftWarning: string[];
  lastPlacedId: string | null;
  highContrast: boolean;
  linkPreview: boolean;
  gridCoordinates: boolean;
  resolving: boolean;
  dimmed: boolean;
  onCellPress: (col: number, row: number) => void;
}

function SectorBoardBase({
  cols,
  rows,
  reactor,
  domes,
  asteroids,
  relays,
  routing,
  selectedRelayId,
  rejectedCell,
  driftWarning,
  lastPlacedId,
  highContrast,
  linkPreview,
  gridCoordinates,
  resolving,
  dimmed,
  onCellPress,
}: Props) {
  const enter = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    enter.setValue(0.94);
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_UI,
    }).start();
  }, [enter]);

  const poweredRelays = useMemo(
    () => new Set(routing.poweredRelayIds),
    [routing.poweredRelayIds],
  );
  const poweredDomes = useMemo(
    () => new Set(routing.poweredDomeIndices),
    [routing.poweredDomeIndices],
  );
  const warnSet = useMemo(() => new Set(driftWarning), [driftWarning]);

  const cells = useMemo(() => {
    const map = new Map<
      string,
      { kind: CellKind; moduleId?: Relay['moduleId']; powered: boolean; id?: string; spin: number }
    >();
    map.set(reactor.col + ':' + reactor.row, {
      kind: 'reactor',
      powered: true,
      spin: 0,
    });
    domes.forEach((d, i) => {
      map.set(d.col + ':' + d.row, {
        kind: 'dome',
        powered: poweredDomes.has(i),
        spin: 0,
      });
    });
    asteroids.forEach(a => {
      map.set(a.col + ':' + a.row, {
        kind: 'asteroid',
        powered: false,
        spin: a.spin,
        id: a.id,
      });
    });
    relays.forEach(r => {
      map.set(r.col + ':' + r.row, {
        kind: 'relay',
        moduleId: r.moduleId,
        powered: poweredRelays.has(r.id),
        spin: 0,
        id: r.id,
      });
    });
    return map;
  }, [reactor, domes, asteroids, relays, poweredDomes, poweredRelays]);

  const gridLines = useMemo(() => {
    const out: React.ReactNode[] = [];
    for (let c = 1; c < cols; c++) {
      out.push(
        <Line
          key={'v' + c}
          x1={BOARD_FRAME + c * CELL}
          y1={BOARD_FRAME}
          x2={BOARD_FRAME + c * CELL}
          y2={BOARD_FRAME + rows * CELL}
          stroke={theme.colors.gridLine}
          strokeWidth={1}
        />,
      );
    }
    for (let r = 1; r < rows; r++) {
      out.push(
        <Line
          key={'h' + r}
          x1={BOARD_FRAME}
          y1={BOARD_FRAME + r * CELL}
          x2={BOARD_FRAME + cols * CELL}
          y2={BOARD_FRAME + r * CELL}
          stroke={theme.colors.gridLine}
          strokeWidth={1}
        />,
      );
    }
    return out;
  }, [cols, rows]);

  const children: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = c + ':' + r;
      const info = cells.get(key);
      const kind: CellKind = info ? info.kind : 'empty';
      children.push(
        <BoardCell
          key={key}
          col={c}
          row={r}
          kind={kind}
          moduleId={info ? info.moduleId : undefined}
          powered={info ? info.powered : false}
          selected={!!info && !!info.id && info.id === selectedRelayId}
          rejected={rejectedCell === key}
          warned={!!info && !!info.id && warnSet.has(info.id)}
          spin={info ? info.spin : 0}
          justPlaced={!!info && !!info.id && info.id === lastPlacedId}
          label={gridCoordinates ? COL_LABELS[c] + (r + 1) : undefined}
          onPress={onCellPress}
        />,
      );
    }
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.board,
        dimmed ? styles.dimmed : null,
        { transform: [{ scale: enter }] },
      ]}
    >
      <View style={styles.highlight} pointerEvents="none" />
      <Svg width={BOARD_W} height={BOARD_H} style={StyleSheet.absoluteFill} pointerEvents="none">
        {gridLines}
      </Svg>
      <BeamLayer
        links={routing.links}
        highContrast={highContrast}
        previewFrom={reactor}
        previewRange={REACTOR_RANGE}
        showPreview={linkPreview && relays.length === 0}
        flash={resolving}
      />
      <View style={styles.cellLayer}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_W,
    height: BOARD_H,
    borderRadius: theme.radius.tile,
    borderWidth: 2,
    borderColor: 'rgba(65,105,225,0.35)',
    backgroundColor: 'rgba(10,22,40,0.78)',
    overflow: 'hidden',
  },
  dimmed: { opacity: 0.35 },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cellLayer: {
    position: 'absolute',
    left: BOARD_FRAME,
    top: BOARD_FRAME,
    width: BOARD_W - 2 * BOARD_FRAME,
    height: BOARD_H - 2 * BOARD_FRAME,
  },
});

export const SectorBoard = memo(SectorBoardBase);
export default SectorBoard;
